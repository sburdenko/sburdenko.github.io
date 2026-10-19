/** Problems and C# solutions for chapter 17: data structure design. C# 9 (Unity): target-typed new() is fine, ??= too. */
import { problem as p } from './problem.js?v=202610191721';

export const PROBLEMS_H = {
  design: [
    p('trie', 'Implement Trie (Prefix Tree)', 208, 'implement-trie-prefix-tree', 'Medium', `public class Trie {
    private sealed class Node {
        public readonly Node[] next = new Node[26];   // one slot per letter: next['c' - 'a']
        public bool end;                              // a word ends exactly here
    }

    private readonly Node root = new Node();          // the root stands for the empty prefix

    public void Insert(string word) {
        var node = root;
        foreach (char ch in word)
            node = node.next[ch - 'a'] ??= new Node();   // walk the edge, or make it if it is missing
        node.end = true;                                 // "app" inside "apple" is a word only after this
    }

    public bool Search(string word) => Find(word)?.end == true;

    public bool StartsWith(string prefix) => Find(prefix) != null;

    private Node Find(string s) {
        var node = root;
        foreach (char ch in s) {
            node = node.next[ch - 'a'];
            if (node == null) return null;   // no edge: no stored word goes this way
        }
        return node;
    }
}`, true),
    p('serialize', 'Serialize and Deserialize Binary Tree', 297, 'serialize-and-deserialize-binary-tree', 'Hard', `public class Codec {
    public string serialize(TreeNode root) {
        var sb = new StringBuilder();
        Write(root, sb);
        return sb.ToString();
    }

    private static void Write(TreeNode node, StringBuilder sb) {
        if (sb.Length > 0) sb.Append(',');
        if (node == null) { sb.Append('#'); return; }   // the marker says where a branch ends
        sb.Append(node.val);                            // pre-order: the node before its children
        Write(node.left, sb);
        Write(node.right, sb);
    }

    public TreeNode deserialize(string data) {
        int pos = 0;
        return Read(data.Split(','), ref pos);
    }

    private static TreeNode Read(string[] tokens, ref int pos) {
        string t = tokens[pos++];                       // the cursor only moves forward
        if (t == "#") return null;
        var node = new TreeNode(int.Parse(t));
        node.left = Read(tokens, ref pos);              // the same order as Write: value, left, right
        node.right = Read(tokens, ref pos);
        return node;
    }
}`, true),
    p('circularQueue', 'Design Circular Queue', 622, 'design-circular-queue', 'Medium', `public class MyCircularQueue {
    private readonly int[] a;
    private int head, count;      // the tail is not stored: (head + count) % a.Length

    public MyCircularQueue(int k) => a = new int[k];

    public bool EnQueue(int value) {
        if (count == a.Length) return false;        // full: refuse, never overwrite
        a[(head + count) % a.Length] = value;       // the next free slot, past the end it wraps to 0
        count++;
        return true;
    }

    public bool DeQueue() {
        if (count == 0) return false;
        head = (head + 1) % a.Length;               // the old value stays in the array, outside the queue
        count--;
        return true;
    }

    public int Front() => count == 0 ? -1 : a[head];

    public int Rear() => count == 0 ? -1 : a[(head + count - 1) % a.Length];

    public bool IsEmpty() => count == 0;

    public bool IsFull() => count == a.Length;
}`),
    p('lfu', 'LFU Cache', 460, 'lfu-cache', 'Hard', `public class LFUCache {
    private sealed class Entry { public int val, freq = 1; public LinkedListNode<int> node; }

    private readonly int capacity;
    private readonly Dictionary<int, Entry> map = new();
    private readonly Dictionary<int, LinkedList<int>> buckets = new();   // freq → keys, oldest first
    private int minFreq;

    public LFUCache(int capacity) => this.capacity = capacity;

    public int Get(int key) {
        if (!map.TryGetValue(key, out var e)) return -1;
        Touch(e);
        return e.val;
    }

    public void Put(int key, int value) {
        if (capacity == 0) return;
        if (map.TryGetValue(key, out var e)) {
            e.val = value;
            Touch(e);                              // a put counts as a use, like a get
            return;
        }
        if (map.Count == capacity) {
            var victims = buckets[minFreq];        // the least frequent keys, oldest first
            map.Remove(victims.First.Value);       // a tie goes to the least recently used
            victims.RemoveFirst();
        }
        minFreq = 1;                               // a new key is always the least frequent
        map[key] = new Entry { val = value, node = Bucket(1).AddLast(key) };
    }

    private void Touch(Entry e) {
        var from = buckets[e.freq];
        from.Remove(e.node);                       // O(1): we hold the node itself
        if (from.Count == 0 && minFreq == e.freq) minFreq++;   // the lowest bucket ran dry
        e.freq++;
        Bucket(e.freq).AddLast(e.node);            // the same node moves: no new allocation
    }

    private LinkedList<int> Bucket(int freq) {
        if (!buckets.TryGetValue(freq, out var list)) buckets[freq] = list = new LinkedList<int>();
        return list;
    }
}`),
  ],
};
