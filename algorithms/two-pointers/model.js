/** Pure algorithm traces. Each event is a complete, rewindable snapshot. */
export function oppositeTrace(values, target) {
  let left = 0, right = values.length - 1, checks = 0;
  const events = [];
  const add = (line, message, done = false) => events.push({ left, right, checks, line, message, done });
  add(0, 'Put L on the smallest value and R on the largest. These are positions, not copies of the numbers.');
  while (left < right) {
    const sum = values[left] + values[right];
    checks++;
    add(2, `${values[left]} + ${values[right]} = ${sum}. Compare this with target ${target}.`);
    if (sum === target) {
      add(3, `Found it: indices ${left} and ${right}. Two different elements add up to ${target}.`, true);
      return { events, found: [left, right] };
    }
    if (sum < target) {
      const discarded = values[left++];
      add(4, `${sum} is too small. Even the largest remaining partner cannot help ${discarded}. Discard L and move it right.`);
    } else {
      const discarded = values[right--];
      add(5, `${sum} is too large. Even the smallest remaining partner makes ${discarded} too big. Discard R and move it left.`);
    }
  }
  add(6, 'L and R have met or crossed. No pair exists; one element cannot be used twice.', true);
  return { events, found: null };
}

export function floydTrace(count, entry) {
  const next = Array.from({ length: count }, (_, i) => i + 1 < count ? i + 1 : entry);
  return floydLinks(next);
}

export function floydLinks(next) {
  let slow = 0, fast = 0, moves = 0;
  const events = [];
  const add = (line, message, phase = 'detect', done = false) => events.push({ slow, fast, moves, line, message, phase, done });
  add(0, 'Both pointers start at node 0. Sharing the starting node does not prove a cycle. Move first.');
  while (fast !== -1 && next[fast] !== -1) {
    const oldFast = fast;
    slow = next[slow];
    fast = next[next[fast]];
    moves++;
    add(2, `Slow takes one link to ${slow}. Fast takes two: ${oldFast} → ${next[oldFast]} → ${fast === -1 ? 'null' : fast}.`);
    if (slow === fast) {
      add(3, `They meet at node ${slow}: a cycle exists. This meeting point is not necessarily its entrance.`);
      slow = 0;
      add(5, 'Reset slow to the head. Leave fast at the meeting point. Now BOTH move one link per step.', 'entry');
      while (slow !== fast) {
        slow = next[slow];
        fast = next[fast];
        moves++;
        add(7, `One link each: slow is at ${slow}, fast is at ${fast}.`, 'entry');
      }
      add(8, `They meet at node ${slow}. This is the cycle entrance: the first node you visit twice from the head.`, 'entry', true);
      return { events, next, entry: slow };
    }
  }
  add(4, 'Fast reached the end (null), so this list has no cycle.', 'detect', true);
  return { events, next, entry: -1 };
}
