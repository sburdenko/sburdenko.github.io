/** Builtin exception hierarchy and the helpers that raise Python errors from JS. */
import { PyClass, PyInstance, PyTuple, PyError, TYPES, str, NONE } from './objects.js?v=202610071646';

export const EXC = {};
const exc = (name, base) => { const c = new PyClass(name, base ? [EXC[base]] : [TYPES.object]); c.isException = true; EXC[name] = c; return c; };

exc('BaseException');
exc('Exception', 'BaseException');
exc('KeyboardInterrupt', 'BaseException');
exc('SystemExit', 'BaseException');
exc('GeneratorExit', 'BaseException');
exc('ArithmeticError', 'Exception');
exc('ZeroDivisionError', 'ArithmeticError');
exc('OverflowError', 'ArithmeticError');
exc('AssertionError', 'Exception');
exc('AttributeError', 'Exception');
exc('EOFError', 'Exception');
exc('ImportError', 'Exception');
exc('ModuleNotFoundError', 'ImportError');
exc('LookupError', 'Exception');
exc('IndexError', 'LookupError');
exc('KeyError', 'LookupError');
exc('NameError', 'Exception');
exc('UnboundLocalError', 'NameError');
exc('OSError', 'Exception');
exc('FileNotFoundError', 'OSError');
exc('RuntimeError', 'Exception');
exc('RecursionError', 'RuntimeError');
exc('NotImplementedError', 'RuntimeError');
exc('StopIteration', 'Exception');
exc('SyntaxError', 'Exception');
exc('IndentationError', 'SyntaxError');
exc('TypeError', 'Exception');
exc('ValueError', 'Exception');
exc('UnicodeError', 'ValueError');
exc('UnicodeDecodeError', 'UnicodeError');
exc('UnicodeEncodeError', 'UnicodeError');
exc('Warning', 'Exception');
exc('DeprecationWarning', 'Warning');

export const isExceptionClass = c => c instanceof PyClass && c.mro.includes(EXC.BaseException);

/** Creates an exception instance with `args` set, like BaseException.__new__ does. */
export function makeExc(cls, args = []) {
  const inst = new PyInstance(cls);
  inst.dict.set('args', new PyTuple(args.map(a => (typeof a === 'string' ? str(a) : a))));
  inst.dict.set('__cause__', NONE);
  inst.dict.set('__context__', NONE);
  return inst;
}

export const pyError = (name, message) => new PyError(makeExc(EXC[name], message === undefined ? [] : [message]));
export const raise = (name, message) => { throw pyError(name, message); };

export const excArgs = inst => (inst.dict.get('args') ?? new PyTuple([])).items;
