/** Recursive-descent parser: tokens → AST. Node shapes are plain objects with a `t` tag and a `line`. */
import { tokenize, PySyntaxError } from './lexer.js?v=202609271602';

const AUG = new Set(['+=', '-=', '*=', '/=', '//=', '%=', '**=', '&=', '|=', '^=', '<<=', '>>=']);
const COMPARE = new Set(['<', '>', '==', '!=', '<=', '>=']);

class Parser {
  constructor(tokens) { this.toks = tokens; this.pos = 0; }
  get cur() { return this.toks[this.pos]; }
  peek(n = 1) { return this.toks[Math.min(this.pos + n, this.toks.length - 1)]; }
  next() { return this.toks[this.pos++]; }
  is(type, value) { const t = this.cur; return t.type === type && (value === undefined || t.value === value); }
  isOp(v) { return this.is('OP', v); }
  isKw(v) { return this.is('KW', v); }
  accept(type, value) { if (this.is(type, value)) return this.next(); return null; }
  expect(type, value) {
    if (this.is(type, value)) return this.next();
    const got = this.cur.type === 'EOF' ? 'end of file' : this.cur.type === 'NEWLINE' ? 'end of line' : `'${this.cur.value}'`;
    throw new PySyntaxError(value !== undefined ? `expected '${value}', got ${got}` : `expected ${type.toLowerCase()}, got ${got}`, this.cur.line);
  }
  fail(msg, line = this.cur.line) { throw new PySyntaxError(msg, line); }

  /* ---------- statements ---------- */
  file() {
    const body = [];
    while (!this.is('EOF')) {
      if (this.accept('NEWLINE')) continue;
      body.push(...this.statement());
    }
    return { t: 'Module', body };
  }

  block() {
    this.expect('OP', ':');
    if (!this.is('NEWLINE')) return this.simpleLine();
    this.expect('NEWLINE');
    while (this.accept('NEWLINE'));
    this.expect('INDENT');
    const body = [];
    while (!this.is('DEDENT') && !this.is('EOF')) {
      if (this.accept('NEWLINE')) continue;
      body.push(...this.statement());
    }
    this.accept('DEDENT');
    return body;
  }

  statement() {
    const t = this.cur;
    if (t.type === 'KW') {
      switch (t.value) {
        case 'if': return [this.ifStmt()];
        case 'while': return [this.whileStmt()];
        case 'for': return [this.forStmt()];
        case 'def': return [this.funcDef([])];
        case 'class': return [this.classDef([])];
        case 'try': return [this.tryStmt()];
        case 'with': return [this.withStmt()];
        default: break;
      }
    }
    if (t.type === 'OP' && t.value === '@') return [this.decorated()];
    if (t.type === 'NAME' && t.value === 'match' && this.looksLikeMatch()) return [this.matchStmt()];
    return this.simpleLine();
  }

  looksLikeMatch() {
    let j = this.pos + 1, depth = 0;
    const n = this.toks[j];
    if (!n || n.type === 'NEWLINE' || (n.type === 'OP' && ['=', '.', ',', ')', ']', '}', ':', '+=', '-='].includes(n.value))) return false;
    for (; j < this.toks.length; j++) {
      const tk = this.toks[j];
      if (tk.type === 'OP' && '([{'.includes(tk.value)) depth++;
      if (tk.type === 'OP' && ')]}'.includes(tk.value)) depth--;
      if (tk.type === 'NEWLINE' && depth === 0) break;
    }
    const before = this.toks[j - 1], after = this.toks[j + 1], name = this.toks[j + 2];
    return before && before.type === 'OP' && before.value === ':' && after && after.type === 'INDENT' && name && name.type === 'NAME' && name.value === 'case';
  }

  simpleLine() {
    const out = [this.simpleStmt()];
    while (this.accept('OP', ';')) {
      if (this.is('NEWLINE') || this.is('EOF')) break;
      out.push(this.simpleStmt());
    }
    if (!this.is('EOF')) this.expect('NEWLINE');
    return out;
  }

  simpleStmt() {
    const line = this.cur.line;
    if (this.cur.type === 'KW') {
      switch (this.cur.value) {
        case 'pass': this.next(); return { t: 'Pass', line };
        case 'break': this.next(); return { t: 'Break', line };
        case 'continue': this.next(); return { t: 'Continue', line };
        case 'return': {
          this.next();
          const value = this.is('NEWLINE') || this.isOp(';') ? null : this.exprList();
          return { t: 'Return', value, line };
        }
        case 'raise': {
          this.next();
          if (this.is('NEWLINE') || this.isOp(';')) return { t: 'Raise', exc: null, cause: null, line };
          const exc = this.expr();
          const cause = this.accept('KW', 'from') ? this.expr() : null;
          return { t: 'Raise', exc, cause, line };
        }
        case 'global': case 'nonlocal': {
          const kind = this.next().value;
          const names = [this.expect('NAME').value];
          while (this.accept('OP', ',')) names.push(this.expect('NAME').value);
          return { t: kind === 'global' ? 'Global' : 'Nonlocal', names, line };
        }
        case 'import': {
          this.next();
          const names = [];
          do {
            let name = this.expect('NAME').value;
            while (this.accept('OP', '.')) name += '.' + this.expect('NAME').value;
            const asname = this.accept('KW', 'as') ? this.expect('NAME').value : null;
            names.push({ name, asname });
          } while (this.accept('OP', ','));
          return { t: 'Import', names, line };
        }
        case 'from': {
          this.next();
          let module = '';
          while (this.accept('OP', '.')) module += '.';
          module += this.expect('NAME').value;
          while (this.accept('OP', '.')) module += '.' + this.expect('NAME').value;
          this.expect('KW', 'import');
          const names = [];
          const paren = this.accept('OP', '(');
          if (this.accept('OP', '*')) names.push({ name: '*', asname: null });
          else do {
            if (paren && this.isOp(')')) break;
            const name = this.expect('NAME').value;
            const asname = this.accept('KW', 'as') ? this.expect('NAME').value : null;
            names.push({ name, asname });
          } while (this.accept('OP', ','));
          if (paren) this.expect('OP', ')');
          return { t: 'ImportFrom', module, names, line };
        }
        case 'del': {
          this.next();
          const targets = [this.target(this.expr())];
          while (this.accept('OP', ',')) targets.push(this.target(this.expr()));
          return { t: 'Del', targets, line };
        }
        case 'assert': {
          this.next();
          const test = this.expr();
          const msg = this.accept('OP', ',') ? this.expr() : null;
          return { t: 'Assert', test, msg, line };
        }
        default: break;
      }
    }
    const first = this.exprListStar();
    if (this.isOp(':')) {
      this.next();
      this.expr();
      const value = this.accept('OP', '=') ? this.exprList() : null;
      return { t: 'AnnAssign', target: this.target(first), value, line };
    }
    if (this.cur.type === 'OP' && AUG.has(this.cur.value)) {
      const op = this.next().value.slice(0, -1);
      const value = this.exprList();
      if (first.t !== 'Name' && first.t !== 'Attribute' && first.t !== 'Subscript') this.fail("illegal expression for augmented assignment");
      return { t: 'AugAssign', target: first, op, value, line };
    }
    if (this.isOp('=')) {
      const targets = [this.target(first)];
      let value = null;
      while (this.accept('OP', '=')) {
        const e = this.isKw('yield') ? this.yieldExpr() : this.exprListStar();
        if (this.isOp('=')) targets.push(this.target(e)); else value = e;
      }
      return { t: 'Assign', targets, value, line };
    }
    return { t: 'Expr', expr: first, line };
  }

  target(e) {
    const ok = n => n.t === 'Name' || n.t === 'Attribute' || n.t === 'Subscript'
      || ((n.t === 'Tuple' || n.t === 'List') && n.elts.every(x => (x.t === 'Starred' ? ok(x.value) : ok(x))));
    if (!ok(e)) this.fail(`cannot assign to ${e.t === 'Constant' ? 'literal' : e.t === 'Call' ? 'function call' : 'expression'} here`, e.line);
    return e;
  }

  decorated() {
    const decorators = [];
    while (this.accept('OP', '@')) {
      decorators.push(this.expr());
      this.expect('NEWLINE');
    }
    if (this.isKw('def')) return this.funcDef(decorators);
    if (this.isKw('class')) return this.classDef(decorators);
    return this.fail('decorator must be followed by def or class');
  }

  ifStmt() {
    const line = this.cur.line;
    this.next();
    const test = this.namedExpr();
    const body = this.block();
    let orelse = [];
    while (this.accept('NEWLINE'));
    if (this.isKw('elif')) {
      this.cur.value = 'if';
      orelse = [this.ifStmt()];
    } else if (this.accept('KW', 'else')) orelse = this.block();
    return { t: 'If', test, body, orelse, line };
  }

  whileStmt() {
    const line = this.cur.line;
    this.next();
    const test = this.namedExpr();
    const body = this.block();
    while (this.accept('NEWLINE'));
    const orelse = this.accept('KW', 'else') ? this.block() : [];
    return { t: 'While', test, body, orelse, line };
  }

  forStmt() {
    const line = this.cur.line;
    this.next();
    const target = this.target(this.targetList());
    this.expect('KW', 'in');
    const iter = this.exprList();
    const body = this.block();
    while (this.accept('NEWLINE'));
    const orelse = this.accept('KW', 'else') ? this.block() : [];
    return { t: 'For', target, iter, body, orelse, line };
  }

  targetList() {
    const line = this.cur.line;
    const elts = [this.starTarget()];
    let tuple = false;
    while (this.accept('OP', ',')) {
      tuple = true;
      if (this.isKw('in') || this.isOp('=')) break;
      elts.push(this.starTarget());
    }
    return tuple ? { t: 'Tuple', elts, line } : elts[0];
  }
  starTarget() {
    const line = this.cur.line;
    if (this.accept('OP', '*')) return { t: 'Starred', value: this.orExpr(), line };
    return this.orExpr();
  }

  params(closing) {
    const args = [], kwonly = [];
    let vararg = null, kwarg = null, seenStar = false, seenDefault = false;
    while (!this.isOp(closing)) {
      if (this.accept('OP', '/')) { this.accept('OP', ','); continue; }
      if (this.accept('OP', '**')) { kwarg = this.expect('NAME').value; this.accept('OP', ','); continue; }
      if (this.accept('OP', '*')) {
        seenStar = true;
        if (this.cur.type === 'NAME') vararg = this.next().value;
        this.accept('OP', ',');
        continue;
      }
      const name = this.expect('NAME').value;
      if (closing === ')' && this.accept('OP', ':')) this.expr();
      let def = null;
      if (this.accept('OP', '=')) { def = this.expr(); seenDefault = true; }
      else if (seenDefault && !seenStar) this.fail('parameter without a default follows parameter with a default');
      (seenStar ? kwonly : args).push({ name, default: def });
      if (!this.accept('OP', ',')) break;
    }
    return { args, vararg, kwonly, kwarg };
  }

  funcDef(decorators) {
    const line = this.cur.line;
    this.expect('KW', 'def');
    const name = this.expect('NAME').value;
    this.expect('OP', '(');
    const params = this.params(')');
    this.expect('OP', ')');
    if (this.accept('OP', '->')) this.expr();
    const body = this.block();
    return { t: 'FunctionDef', name, params, body, decorators, line, isGen: containsYield(body) };
  }

  classDef(decorators) {
    const line = this.cur.line;
    this.expect('KW', 'class');
    const name = this.expect('NAME').value;
    const bases = [], keywords = [];
    if (this.accept('OP', '(')) {
      while (!this.isOp(')')) {
        if (this.cur.type === 'NAME' && this.peek().type === 'OP' && this.peek().value === '=') {
          const kw = this.next().value; this.next(); keywords.push({ name: kw, value: this.expr() });
        } else bases.push(this.expr());
        if (!this.accept('OP', ',')) break;
      }
      this.expect('OP', ')');
    }
    const body = this.block();
    return { t: 'ClassDef', name, bases, keywords, body, decorators, line };
  }

  tryStmt() {
    const line = this.cur.line;
    this.next();
    const body = this.block();
    const handlers = [];
    let orelse = [], finalbody = [];
    for (;;) {
      while (this.accept('NEWLINE'));
      if (this.isKw('except')) {
        const hl = this.cur.line;
        this.next();
        let type = null, name = null;
        if (!this.isOp(':')) {
          type = this.expr();
          if (this.accept('OP', ',')) { const elts = [type, this.expr()]; while (this.accept('OP', ',')) elts.push(this.expr()); type = { t: 'Tuple', elts, line: hl }; }
          if (this.accept('KW', 'as')) name = this.expect('NAME').value;
        }
        handlers.push({ type, name, body: this.block(), line: hl });
        continue;
      }
      if (this.accept('KW', 'else')) { orelse = this.block(); continue; }
      if (this.accept('KW', 'finally')) { finalbody = this.block(); continue; }
      break;
    }
    if (!handlers.length && !finalbody.length) this.fail("expected 'except' or 'finally' block");
    return { t: 'Try', body, handlers, orelse, finalbody, line };
  }

  withStmt() {
    const line = this.cur.line;
    this.next();
    const items = [];
    const paren = this.accept('OP', '(');
    do {
      if (paren && this.isOp(')')) break;
      const expr = this.expr();
      const target = this.accept('KW', 'as') ? this.target(this.starTarget()) : null;
      items.push({ expr, target });
    } while (this.accept('OP', ','));
    if (paren) this.expect('OP', ')');
    return { t: 'With', items, body: this.block(), line };
  }

  matchStmt() {
    const line = this.cur.line;
    this.next();
    const subject = this.exprListStar();
    this.expect('OP', ':');
    this.expect('NEWLINE');
    while (this.accept('NEWLINE'));
    this.expect('INDENT');
    const cases = [];
    while (!this.is('DEDENT') && !this.is('EOF')) {
      if (this.accept('NEWLINE')) continue;
      const cl = this.cur.line;
      if (!(this.cur.type === 'NAME' && this.cur.value === 'case')) this.fail("expected 'case'");
      this.next();
      const pattern = this.orPattern();
      const guard = this.accept('KW', 'if') ? this.namedExpr() : null;
      cases.push({ pattern, guard, body: this.block(), line: cl });
    }
    this.accept('DEDENT');
    return { t: 'Match', subject, cases, line };
  }

  /* ---------- patterns ---------- */
  orPattern() {
    const alts = [this.closedPattern()];
    while (this.accept('OP', '|')) alts.push(this.closedPattern());
    let pattern = alts.length > 1 ? { p: 'or', alts } : alts[0];
    if (this.accept('KW', 'as')) pattern = { p: 'as', pattern, name: this.expect('NAME').value };
    return pattern;
  }
  closedPattern() {
    const t = this.cur;
    if (t.type === 'OP' && (t.value === '-' || t.value === '(' || t.value === '[' || t.value === '{')) {
      if (t.value === '-') { this.next(); const v = this.next(); return { p: 'literal', value: { t: 'UnaryOp', op: '-', operand: { t: 'Constant', kind: v.type.toLowerCase(), value: v.value, line: v.line }, line: v.line } }; }
      if (t.value === '{') return this.mappingPattern();
      const closing = t.value === '(' ? ')' : ']';
      this.next();
      const items = [];
      let trailing = false;
      while (!this.isOp(closing)) {
        if (this.accept('OP', '*')) items.push({ p: 'star', name: this.expect('NAME').value });
        else items.push(this.orPattern());
        trailing = !!this.accept('OP', ',');
        if (!trailing) break;
      }
      this.expect('OP', closing);
      if (closing === ')' && items.length === 1 && !trailing && items[0].p !== 'star') return items[0];
      return { p: 'sequence', items };
    }
    if (t.type === 'INT' || t.type === 'FLOAT' || t.type === 'STRING' || t.type === 'FSTRING' || t.type === 'BYTES') {
      const value = this.atom();
      return { p: 'literal', value };
    }
    if (t.type === 'KW' && (t.value === 'None' || t.value === 'True' || t.value === 'False')) return { p: 'literal', value: this.atom() };
    if (t.type === 'NAME') {
      let expr = { t: 'Name', id: this.next().value, line: t.line };
      let dotted = false;
      while (this.accept('OP', '.')) { expr = { t: 'Attribute', value: expr, attr: this.expect('NAME').value, line: t.line }; dotted = true; }
      if (this.accept('OP', '(')) {
        const args = [], kwargs = [];
        while (!this.isOp(')')) {
          if (this.cur.type === 'NAME' && this.peek().type === 'OP' && this.peek().value === '=') {
            const name = this.next().value; this.next(); kwargs.push({ name, pattern: this.orPattern() });
          } else args.push(this.orPattern());
          if (!this.accept('OP', ',')) break;
        }
        this.expect('OP', ')');
        return { p: 'class', cls: expr, args, kwargs };
      }
      if (dotted) return { p: 'value', expr };
      return expr.id === '_' ? { p: 'wildcard' } : { p: 'capture', name: expr.id };
    }
    return this.fail('invalid pattern');
  }
  mappingPattern() {
    this.expect('OP', '{');
    const items = [];
    let rest = null;
    while (!this.isOp('}')) {
      if (this.accept('OP', '**')) rest = this.expect('NAME').value;
      else {
        const key = this.closedPattern();
        if (key.p !== 'literal' && key.p !== 'value') this.fail('mapping pattern keys may only be literals or dotted names');
        this.expect('OP', ':');
        items.push({ key: key.p === 'literal' ? key.value : key.expr, pattern: this.orPattern() });
      }
      if (!this.accept('OP', ',')) break;
    }
    this.expect('OP', '}');
    return { p: 'mapping', items, rest };
  }

  /* ---------- expressions ---------- */
  exprList() {
    const line = this.cur.line;
    const first = this.expr();
    if (!this.isOp(',')) return first;
    const elts = [first];
    while (this.accept('OP', ',')) {
      if (this.exprEnds()) break;
      elts.push(this.expr());
    }
    return { t: 'Tuple', elts, line };
  }
  exprListStar() {
    const line = this.cur.line;
    const one = () => (this.isOp('*') ? (this.next(), { t: 'Starred', value: this.orExpr(), line }) : this.namedExpr());
    const first = one();
    if (!this.isOp(',')) return first;
    const elts = [first];
    while (this.accept('OP', ',')) {
      if (this.exprEnds()) break;
      elts.push(one());
    }
    return { t: 'Tuple', elts, line };
  }
  exprEnds() {
    const t = this.cur;
    return t.type === 'NEWLINE' || t.type === 'EOF' || (t.type === 'OP' && ['=', ')', ']', '}', ':', ';'].includes(t.value)) || (t.type === 'KW' && t.value === 'in') || (t.type === 'OP' && AUG.has(t.value));
  }

  namedExpr() {
    if (this.cur.type === 'NAME' && this.peek().type === 'OP' && this.peek().value === ':=') {
      const line = this.cur.line, id = this.next().value;
      this.next();
      return { t: 'NamedExpr', target: { t: 'Name', id, line }, value: this.expr(), line };
    }
    return this.expr();
  }

  expr() {
    if (this.isKw('lambda')) return this.lambda();
    const line = this.cur.line;
    const body = this.orTest();
    if (this.accept('KW', 'if')) {
      const test = this.orTest();
      this.expect('KW', 'else');
      return { t: 'IfExp', test, body, orelse: this.expr(), line };
    }
    return body;
  }
  lambda() {
    const line = this.cur.line;
    this.next();
    const params = this.params(':');
    this.expect('OP', ':');
    return { t: 'Lambda', params, body: this.expr(), line };
  }
  yieldExpr() {
    const line = this.cur.line;
    this.expect('KW', 'yield');
    if (this.accept('KW', 'from')) return { t: 'YieldFrom', value: this.expr(), line };
    if (this.exprEnds()) return { t: 'Yield', value: null, line };
    return { t: 'Yield', value: this.exprList(), line };
  }
  orTest() {
    const line = this.cur.line;
    const first = this.andTest();
    if (!this.isKw('or')) return first;
    const values = [first];
    while (this.accept('KW', 'or')) values.push(this.andTest());
    return { t: 'BoolOp', op: 'or', values, line };
  }
  andTest() {
    const line = this.cur.line;
    const first = this.notTest();
    if (!this.isKw('and')) return first;
    const values = [first];
    while (this.accept('KW', 'and')) values.push(this.notTest());
    return { t: 'BoolOp', op: 'and', values, line };
  }
  notTest() {
    const line = this.cur.line;
    if (this.accept('KW', 'not')) return { t: 'UnaryOp', op: 'not', operand: this.notTest(), line };
    return this.comparison();
  }
  comparison() {
    const line = this.cur.line;
    const left = this.orExpr();
    const ops = [], comparators = [];
    for (;;) {
      if (this.cur.type === 'OP' && COMPARE.has(this.cur.value)) ops.push(this.next().value);
      else if (this.isKw('in')) { this.next(); ops.push('in'); }
      else if (this.isKw('not') && this.peek().type === 'KW' && this.peek().value === 'in') { this.next(); this.next(); ops.push('not in'); }
      else if (this.isKw('is')) { this.next(); ops.push(this.accept('KW', 'not') ? 'is not' : 'is'); }
      else break;
      comparators.push(this.orExpr());
    }
    return ops.length ? { t: 'Compare', left, ops, comparators, line } : left;
  }
  binary(next, ops) {
    const line = this.cur.line;
    let left = next.call(this);
    while (this.cur.type === 'OP' && ops.includes(this.cur.value)) {
      const op = this.next().value;
      left = { t: 'BinOp', op, left, right: next.call(this), line };
    }
    return left;
  }
  orExpr() { return this.binary(this.xorExpr, ['|']); }
  xorExpr() { return this.binary(this.andExpr, ['^']); }
  andExpr() { return this.binary(this.shiftExpr, ['&']); }
  shiftExpr() { return this.binary(this.arith, ['<<', '>>']); }
  arith() { return this.binary(this.term, ['+', '-']); }
  term() { return this.binary(this.factor, ['*', '/', '//', '%', '@']); }
  factor() {
    const line = this.cur.line;
    if (this.cur.type === 'OP' && ['-', '+', '~'].includes(this.cur.value)) {
      const op = this.next().value;
      return { t: 'UnaryOp', op, operand: this.factor(), line };
    }
    return this.power();
  }
  power() {
    const line = this.cur.line;
    const base = this.primary();
    if (this.accept('OP', '**')) return { t: 'BinOp', op: '**', left: base, right: this.factor(), line };
    return base;
  }
  primary() {
    let node = this.atom();
    for (;;) {
      const line = this.cur.line;
      if (this.accept('OP', '.')) node = { t: 'Attribute', value: node, attr: this.expect('NAME').value, line };
      else if (this.isOp('(')) node = this.call(node);
      else if (this.accept('OP', '[')) {
        const index = this.subscriptList();
        this.expect('OP', ']');
        node = { t: 'Subscript', value: node, index, line };
      } else return node;
    }
  }
  subscriptList() {
    const line = this.cur.line;
    const first = this.subscript();
    if (!this.isOp(',')) return first;
    const elts = [first];
    while (this.accept('OP', ',')) { if (this.isOp(']')) break; elts.push(this.subscript()); }
    return { t: 'Tuple', elts, line };
  }
  subscript() {
    const line = this.cur.line;
    const lower = this.isOp(':') ? null : this.namedExpr();
    if (!this.accept('OP', ':')) return lower;
    const upper = this.isOp(':') || this.isOp(']') || this.isOp(',') ? null : this.expr();
    let step = null;
    if (this.accept('OP', ':')) step = this.isOp(']') || this.isOp(',') ? null : this.expr();
    return { t: 'Slice', lower, upper, step, line };
  }
  call(func) {
    const line = this.cur.line;
    this.expect('OP', '(');
    const args = [], keywords = [];
    while (!this.isOp(')')) {
      if (this.accept('OP', '**')) keywords.push({ name: null, value: this.expr() });
      else if (this.accept('OP', '*')) args.push({ t: 'Starred', value: this.expr(), line });
      else if (this.cur.type === 'NAME' && this.peek().type === 'OP' && this.peek().value === '=') {
        const name = this.next().value; this.next();
        keywords.push({ name, value: this.expr() });
      } else {
        const e = this.namedExpr();
        if (this.isKw('for')) args.push({ t: 'GeneratorExp', elt: e, gens: this.comprehension(), line });
        else args.push(e);
      }
      if (!this.accept('OP', ',')) break;
    }
    this.expect('OP', ')');
    return { t: 'Call', func, args, keywords, line };
  }
  comprehension() {
    const gens = [];
    while (this.accept('KW', 'for')) {
      const target = this.target(this.targetList());
      this.expect('KW', 'in');
      const iter = this.orTest();
      const ifs = [];
      while (this.accept('KW', 'if')) ifs.push(this.orTestNoCond());
      gens.push({ target, iter, ifs });
    }
    return gens;
  }
  orTestNoCond() { return this.orTest(); }

  atom() {
    const t = this.cur, line = t.line;
    switch (t.type) {
      case 'NAME': this.next(); return { t: 'Name', id: t.value, line };
      case 'INT': this.next(); return { t: 'Constant', kind: 'int', value: t.value, line };
      case 'FLOAT': this.next(); return { t: 'Constant', kind: 'float', value: t.value, line };
      case 'STRING': case 'FSTRING': case 'BYTES': return this.strings();
      case 'KW':
        if (t.value === 'None') { this.next(); return { t: 'Constant', kind: 'none', value: null, line }; }
        if (t.value === 'True') { this.next(); return { t: 'Constant', kind: 'bool', value: true, line }; }
        if (t.value === 'False') { this.next(); return { t: 'Constant', kind: 'bool', value: false, line }; }
        if (t.value === 'lambda') return this.lambda();
        if (t.value === 'yield') return this.yieldExpr();
        break;
      case 'OP':
        if (t.value === '(') return this.parenAtom();
        if (t.value === '[') return this.listAtom();
        if (t.value === '{') return this.dictOrSetAtom();
        if (t.value === '...') { this.next(); return { t: 'Constant', kind: 'ellipsis', value: null, line }; }
        break;
      default: break;
    }
    const got = t.type === 'NEWLINE' ? 'end of line' : t.type === 'EOF' ? 'end of file' : t.type === 'INDENT' ? 'unexpected indent' : `'${t.value}'`;
    return this.fail(t.type === 'INDENT' ? 'unexpected indent' : `invalid syntax near ${got}`);
  }

  strings() {
    const line = this.cur.line;
    const parts = [];
    let isBytes = false, hasF = false, raw = '';
    while (this.is('STRING') || this.is('FSTRING') || this.is('BYTES')) {
      const tk = this.next();
      if (tk.type === 'BYTES') isBytes = true;
      if (tk.type === 'FSTRING') { hasF = true; parts.push(...parseFString(tk.value, tk.line)); }
      else { parts.push({ str: tk.value }); raw += tk.value; }
    }
    if (isBytes) return { t: 'Constant', kind: 'bytes', value: raw, line };
    if (!hasF) return { t: 'Constant', kind: 'str', value: raw, line };
    return { t: 'FString', parts, line };
  }

  parenAtom() {
    const line = this.cur.line;
    this.expect('OP', '(');
    if (this.accept('OP', ')')) return { t: 'Tuple', elts: [], line };
    if (this.isKw('yield')) { const y = this.yieldExpr(); this.expect('OP', ')'); return y; }
    const first = this.isOp('*') ? (this.next(), { t: 'Starred', value: this.orExpr(), line }) : this.namedExpr();
    if (this.isKw('for')) {
      const gens = this.comprehension();
      this.expect('OP', ')');
      return { t: 'GeneratorExp', elt: first, gens, line };
    }
    if (this.accept('OP', ')')) return first.t === 'Starred' ? this.fail('cannot use starred expression here') : first;
    const elts = [first];
    while (this.accept('OP', ',')) {
      if (this.isOp(')')) break;
      elts.push(this.isOp('*') ? (this.next(), { t: 'Starred', value: this.orExpr(), line }) : this.namedExpr());
    }
    this.expect('OP', ')');
    return { t: 'Tuple', elts, line };
  }

  listAtom() {
    const line = this.cur.line;
    this.expect('OP', '[');
    if (this.accept('OP', ']')) return { t: 'List', elts: [], line };
    const first = this.isOp('*') ? (this.next(), { t: 'Starred', value: this.orExpr(), line }) : this.namedExpr();
    if (this.isKw('for')) {
      const gens = this.comprehension();
      this.expect('OP', ']');
      return { t: 'ListComp', elt: first, gens, line };
    }
    const elts = [first];
    while (this.accept('OP', ',')) {
      if (this.isOp(']')) break;
      elts.push(this.isOp('*') ? (this.next(), { t: 'Starred', value: this.orExpr(), line }) : this.namedExpr());
    }
    this.expect('OP', ']');
    return { t: 'List', elts, line };
  }

  dictOrSetAtom() {
    const line = this.cur.line;
    this.expect('OP', '{');
    if (this.accept('OP', '}')) return { t: 'Dict', items: [], line };
    if (this.accept('OP', '**')) {
      const items = [{ key: null, value: this.orExpr() }];
      return this.dictRest(items, line);
    }
    const first = this.isOp('*') ? (this.next(), { t: 'Starred', value: this.orExpr(), line }) : this.namedExpr();
    if (this.accept('OP', ':')) {
      const value = this.expr();
      if (this.isKw('for')) {
        const gens = this.comprehension();
        this.expect('OP', '}');
        return { t: 'DictComp', key: first, value, gens, line };
      }
      return this.dictRest([{ key: first, value }], line);
    }
    if (this.isKw('for')) {
      const gens = this.comprehension();
      this.expect('OP', '}');
      return { t: 'SetComp', elt: first, gens, line };
    }
    const elts = [first];
    while (this.accept('OP', ',')) {
      if (this.isOp('}')) break;
      elts.push(this.isOp('*') ? (this.next(), { t: 'Starred', value: this.orExpr(), line }) : this.namedExpr());
    }
    this.expect('OP', '}');
    return { t: 'Set', elts, line };
  }
  dictRest(items, line) {
    while (this.accept('OP', ',')) {
      if (this.isOp('}')) break;
      if (this.accept('OP', '**')) { items.push({ key: null, value: this.orExpr() }); continue; }
      const key = this.expr();
      this.expect('OP', ':');
      items.push({ key, value: this.expr() });
    }
    this.expect('OP', '}');
    return { t: 'Dict', items, line };
  }
}

/** Splits an f-string body into literal parts and { expr, conv, spec } placeholders. */
export function parseFString(text, line) {
  const parts = [];
  let i = 0, lit = '';
  const flush = () => { if (lit) parts.push({ str: lit }); lit = ''; };
  while (i < text.length) {
    const c = text[i];
    if (c === '{') {
      if (text[i + 1] === '{') { lit += '{'; i += 2; continue; }
      flush();
      let depth = 1, j = i + 1, inStr = null;
      let exprEnd = -1, conv = null, specStart = -1;
      for (; j < text.length; j++) {
        const ch = text[j];
        if (inStr) { if (ch === inStr) inStr = null; continue; }
        if (ch === "'" || ch === '"') { inStr = ch; continue; }
        if ('([{'.includes(ch)) depth++;
        else if (')]}'.includes(ch)) { depth--; if (depth === 0) break; }
        else if (depth === 1 && ch === '!' && text[j + 1] !== '=' && exprEnd < 0) { exprEnd = j; conv = text[j + 1]; j += 1; }
        else if (depth === 1 && ch === ':' && specStart < 0) { if (exprEnd < 0) exprEnd = j; specStart = j + 1; depth = 1; let k = j + 1, d = 1; while (k < text.length) { if (text[k] === '{') d++; else if (text[k] === '}') { d--; if (d === 0) break; } k++; } j = k; break; }
      }
      if (j >= text.length) throw new PySyntaxError("f-string: expecting '}'", line);
      if (exprEnd < 0) exprEnd = j;
      let exprText = text.slice(i + 1, exprEnd);
      let debug = null;
      if (/=\s*$/.test(exprText) && !/[=!<>]=\s*$/.test(exprText)) { debug = exprText; exprText = exprText.replace(/=\s*$/, ''); if (!conv && specStart < 0) conv = 'r'; }
      const spec = specStart >= 0 ? parseFString(text.slice(specStart, j), line) : null;
      if (debug) parts.push({ str: debug });
      parts.push({ expr: parseExpression(exprText, line), conv, spec, text: exprText.trim() });
      i = j + 1;
      continue;
    }
    if (c === '}') {
      if (text[i + 1] === '}') { lit += '}'; i += 2; continue; }
      throw new PySyntaxError("f-string: single '}' is not allowed", line);
    }
    lit += c; i++;
  }
  flush();
  return parts;
}

export function parseExpression(text, line = 1) {
  const toks = tokenize('(' + text.trim() + ')').map(tk => ({ ...tk, line }));
  const p = new Parser(toks);
  const e = p.exprListStar();
  if (!p.is('NEWLINE') && !p.is('EOF')) p.fail('invalid syntax in f-string expression');
  return e;
}

function containsYield(body) {
  const walk = n => {
    if (!n || typeof n !== 'object') return false;
    if (Array.isArray(n)) return n.some(walk);
    if (n.t === 'Yield' || n.t === 'YieldFrom') return true;
    if (n.t === 'FunctionDef' || n.t === 'Lambda' || n.t === 'ClassDef') return false;
    return Object.keys(n).some(k => k !== 't' && walk(n[k]));
  };
  return walk(body);
}

export function parse(source) {
  return new Parser(tokenize(source)).file();
}
