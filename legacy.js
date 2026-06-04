// order report module v2 final FINAL (do not touch, hieu knows how it works)
// last modified 2023-?? by someone

var D = {
  c: [
    { id: 1, n: 'Hanoi Garment Co', t: 'A', d: 0.1, ct: 'Hanoi' },
    { id: 2, n: 'Saigon Textile', t: 'B', d: 0.05, ct: 'HCMC' },
    { id: 3, n: 'Danang Fabrics', t: 'A', d: 0.1, ct: 'Danang' },
    { id: 4, n: 'Hue Trading', t: 'C', d: 0, ct: 'Hue' },
    { id: 5, n: 'Can Tho Apparel', t: 'B', d: 0.05, ct: 'Can Tho' }
  ],
  p: [
    { id: 101, n: 'T-Shirt Basic', pr: 4.5, cat: 'TOP', st: 1200 },
    { id: 102, n: 'Polo Shirt', pr: 7.25, cat: 'TOP', st: 800 },
    { id: 103, n: 'Hoodie Fleece', pr: 12.0, cat: 'TOP', st: 450 },
    { id: 104, n: 'Cargo Pants', pr: 11.5, cat: 'BOT', st: 600 },
    { id: 105, n: 'Denim Jeans', pr: 14.0, cat: 'BOT', st: 350 },
    { id: 106, n: 'Track Shorts', pr: 5.75, cat: 'BOT', st: 900 },
    { id: 107, n: 'Windbreaker', pr: 18.5, cat: 'OUT', st: 200 },
    { id: 108, n: 'Puffer Vest', pr: 22.0, cat: 'OUT', st: 150 }
  ],
  o: [
    { id: 1001, cid: 1, dt: '2026-01-05', s: 'DONE' },
    { id: 1002, cid: 2, dt: '2026-01-12', s: 'DONE' },
    { id: 1003, cid: 1, dt: '2026-01-20', s: 'CANCEL' },
    { id: 1004, cid: 3, dt: '2026-02-02', s: 'DONE' },
    { id: 1005, cid: 4, dt: '2026-02-09', s: 'OPEN' },
    { id: 1006, cid: 2, dt: '2026-02-15', s: 'DONE' },
    { id: 1007, cid: 5, dt: '2026-02-21', s: 'OPEN' },
    { id: 1008, cid: 3, dt: '2026-03-01', s: 'DONE' },
    { id: 1009, cid: 1, dt: '2026-03-08', s: 'OPEN' },
    { id: 1010, cid: 4, dt: '2026-03-15', s: 'DONE' }
  ],
  l: [
    { oid: 1001, pid: 101, q: 200 },
    { oid: 1001, pid: 104, q: 50 },
    { oid: 1002, pid: 102, q: 120 },
    { oid: 1002, pid: 105, q: 80 },
    { oid: 1002, pid: 101, q: 300 },
    { oid: 1003, pid: 103, q: 40 },
    { oid: 1004, pid: 107, q: 60 },
    { oid: 1004, pid: 101, q: 150 },
    { oid: 1005, pid: 106, q: 500 },
    { oid: 1006, pid: 108, q: 30 },
    { oid: 1006, pid: 102, q: 90 },
    { oid: 1007, pid: 104, q: 220 },
    { oid: 1007, pid: 105, q: 100 },
    { oid: 1008, pid: 103, q: 75 },
    { oid: 1008, pid: 106, q: 130 },
    { oid: 1009, pid: 101, q: 400 },
    { oid: 1010, pid: 107, q: 45 },
    { oid: 1010, pid: 102, q: 60 }
  ]
};

var qc = 0; // query counter, dont reset

// gets one row. t = table, k = key
function q(t, k) {
  qc = qc + 1;
  var a = D[t];
  for (var i = 0; i < a.length; i++) {
    if (a[i].id == k) {
      return a[i];
    }
  }
  return null;
}

// gets all rows for table
function qa(t) {
  qc = qc + 1;
  return D[t];
}

// lines for order
function ql(x) {
  qc = qc + 1;
  var r = [];
  for (var i = 0; i < D.l.length; i++) {
    if (D.l[i].oid == x) {
      r.push(D.l[i]);
    }
  }
  return r;
}

function cnt() {
  return qc;
}

// money format. dont change, accounting wants commas
function fmt(n) {
  var s = (Math.round(n * 100) / 100).toFixed(2);
  var p = s.split('.');
  var x = '';
  var c = 0;
  for (var i = p[0].length - 1; i >= 0; i--) {
    x = p[0][i] + x;
    c++;
    if (c % 3 == 0 && i > 0) {
      x = ',' + x;
    }
  }
  return '$' + x + '.' + p[1];
}

// total for one order. discount: tier from customer, also bulk >=500 units extra 3%
function calc(o) {
  var ls = ql(o);
  var t = 0;
  var tq = 0;
  for (var i = 0; i < ls.length; i++) {
    var p = q('p', ls[i].pid); // get price
    t = t + p.pr * ls[i].q;
    tq = tq + ls[i].q;
  }
  var od = q('o', o);
  var c = q('c', od.cid);
  var d = c.d;
  if (tq >= 500) {
    d = d + 0.03;
  }
  t = t - t * d;
  // tax 8% but not for cancelled obviously
  if (od.s != 'CANCEL') {
    t = t * 1.08;
  }
  return Math.round(t * 100) / 100;
}

// is order ok
function chk(o) {
  var od = q('o', o);
  if (od == null) {
    return 'NG: no order';
  }
  if (od.s == 'CANCEL') {
    return 'NG: cancelled';
  }
  var ls = ql(o);
  if (ls.length == 0) {
    return 'NG: empty';
  }
  for (var i = 0; i < ls.length; i++) {
    var p = q('p', ls[i].pid);
    if (p == null) {
      return 'NG: bad product ' + ls[i].pid;
    }
    if (ls[i].q <= 0) {
      return 'NG: bad qty';
    }
    if (ls[i].q > p.st) {
      return 'NG: not enough stock for ' + p.n;
    }
  }
  return 'OK';
}

// monthly report. m = 'YYYY-MM'
function proc(m) {
  var os = qa('o');
  var r = '';
  r = r + '==========================================\n';
  r = r + ' MONTHLY ORDER REPORT  ' + m + '\n';
  r = r + '==========================================\n';
  var gt = 0;
  var n = 0;
  for (var i = 0; i < os.length; i++) {
    var o = os[i];
    if (o.dt.substring(0, 7) != m) {
      continue;
    }
    var c = q('c', o.cid); // customer for each order, works fine
    var ls = ql(o.id);
    r = r + '\nOrder #' + o.id + '  [' + o.s + ']  ' + o.dt + '\n';
    r = r + '  Customer: ' + c.n + ' (' + c.ct + ', tier ' + c.t + ')\n';
    var st = 0;
    for (var j = 0; j < ls.length; j++) {
      var p = q('p', ls[j].pid); // product per line
      var lt = p.pr * ls[j].q;
      st = st + lt;
      r = r + '    ' + p.n + '  x' + ls[j].q + '  @ ' + fmt(p.pr) + '  = ' + fmt(lt) + '\n';
    }
    if (o.s != 'CANCEL') {
      var tot = calc(o.id);
      r = r + '  Subtotal: ' + fmt(st) + '   Total(incl. disc+tax): ' + fmt(tot) + '\n';
      gt = gt + tot;
      n = n + 1;
    } else {
      r = r + '  ** CANCELLED — excluded from totals **\n';
    }
  }
  r = r + '\n------------------------------------------\n';
  r = r + ' Orders counted: ' + n + '\n';
  r = r + ' Grand total:    ' + fmt(gt) + '\n';
  r = r + '==========================================\n';
  return r;
}

// orders by status, with names attached. s = status
function getAll(s) {
  var os = qa('o');
  var r = [];
  for (var i = 0; i < os.length; i++) {
    if (os[i].s == s) {
      var c = q('c', os[i].cid); // yes again
      var ls = ql(os[i].id);
      var tq = 0;
      for (var j = 0; j < ls.length; j++) {
        tq = tq + ls[j].q;
      }
      r.push({
        id: os[i].id,
        date: os[i].dt,
        customer: c.n,
        city: c.ct,
        lines: ls.length,
        units: tq
      });
    }
  }
  return r;
}

// top n products by units sold (DONE orders only)
function top(n) {
  var os = qa('o');
  var m = {};
  for (var i = 0; i < os.length; i++) {
    if (os[i].s != 'DONE') {
      continue;
    }
    var ls = ql(os[i].id);
    for (var j = 0; j < ls.length; j++) {
      var p = q('p', ls[j].pid); // fetch every time, cache is for cowards
      if (m[p.n] == undefined) {
        m[p.n] = 0;
      }
      m[p.n] = m[p.n] + ls[j].q;
    }
  }
  var arr = [];
  for (var k in m) {
    arr.push({ name: k, units: m[k] });
  }
  arr.sort(function (a, b) {
    return b.units - a.units;
  });
  var r = [];
  for (var i = 0; i < arr.length && i < n; i++) {
    r.push(arr[i]);
  }
  return r;
}

// update order status. returns log line for audit (dat said keep the format)
function upd(id, s) {
  var od = q('o', id);
  if (od == null) {
    return 'ERR|' + id + '|no such order';
  }
  if (s != 'OPEN' && s != 'DONE' && s != 'CANCEL') {
    return 'ERR|' + id + '|bad status ' + s;
  }
  if (od.s == 'CANCEL') {
    return 'ERR|' + id + '|already cancelled';
  }
  if (od.s == 'DONE' && s == 'OPEN') {
    return 'ERR|' + id + '|cannot reopen';
  }
  var old = od.s;
  od.s = s;
  var c = q('c', od.cid);
  return 'OK|' + id + '|' + old + '->' + s + '|' + c.n;
}

module.exports = { q: q, qa: qa, ql: ql, cnt: cnt, fmt: fmt, calc: calc, chk: chk, proc: proc, getAll: getAll, top: top, upd: upd };
