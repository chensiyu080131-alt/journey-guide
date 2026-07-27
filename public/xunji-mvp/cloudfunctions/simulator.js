// 寻迹云函数控制台 —— 浏览器端模拟器（免后端，逻辑与微信云函数一致）
// 数据源：../db/literary-routes.json（公开静态文件）
// 真实云函数源码：../weapp/cloudfunctions/<name>/index.js
(function () {
  'use strict';

  var LS = {
    openid: 'xj_openid',
    checkins: 'xj_checkins',
    collections: 'xj_collections'
  };

  var dataset = null;
  var spotsById = {};

  function $(id) { return document.getElementById(id); }

  function getOpenid() {
    var v = localStorage.getItem(LS.openid);
    if (!v) {
      v = 'o' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      localStorage.setItem(LS.openid, v);
    }
    return v;
  }
  function getCheckins() {
    try { return JSON.parse(localStorage.getItem(LS.checkins)) || []; }
    catch (e) { return []; }
  }
  function setCheckins(arr) { localStorage.setItem(LS.checkins, JSON.stringify(arr)); }
  function getCollections() {
    try { return JSON.parse(localStorage.getItem(LS.collections)) || { openid: getOpenid(), unlockedSpotIds: [] }; }
    catch (e) { return { openid: getOpenid(), unlockedSpotIds: [] }; }
  }
  function setCollections(c) { localStorage.setItem(LS.collections, JSON.stringify(c)); }

  function pretty(obj) { return JSON.stringify(obj, null, 2); }

  // ---------- 模拟三个云函数（与 weapp/cloudfunctions/*/index.js 逻辑一致） ----------
  function apiGetRoutes() {
    return {
      poems: dataset.poems,
      spots: dataset.spots,
      routes: dataset.routes,
      unlockedSpotIds: getCollections().unlockedSpotIds
    };
  }

  function apiCheckin(routeId, spotId, city) {
    var openid = getOpenid();
    if (!spotId) return { ok: false, msg: 'missing spotId' };
    var checkins = getCheckins();
    var exists = checkins.some(function (c) { return c.openid === openid && c.spotId === spotId; });
    if (!exists) {
      checkins.push({
        openid: openid, routeId: routeId, spotId: spotId,
        city: city || '', createdAt: new Date().toISOString(), geoVerified: true
      });
      setCheckins(checkins);
    }
    var col = getCollections();
    if (col.unlockedSpotIds.indexOf(spotId) === -1) col.unlockedSpotIds.push(spotId);
    setCollections(col);
    return { ok: true, unlockedSpotIds: col.unlockedSpotIds };
  }

  function apiStats() {
    var checkins = getCheckins();
    var users = {};
    var heat = {};
    var city = {};
    checkins.forEach(function (r) {
      if (r.openid) users[r.openid] = true;
      if (r.spotId) heat[r.spotId] = (heat[r.spotId] || 0) + 1;
      if (r.city) city[r.city] = (city[r.city] || 0) + 1;
    });
    return {
      participants: Object.keys(users).length,
      totalCheckins: checkins.length,
      heat: heat,
      city: city
    };
  }

  // ---------- UI ----------
  function loadDataset(cb) {
    fetch('../db/literary-routes.json')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        dataset = d;
        d.spots.forEach(function (s) { spotsById[s.id] = s; });
        cb();
      })
      .catch(function (e) { alert('加载数据源失败：' + e); });
  }

  function loadSource(name, elId) {
    fetch('../weapp/cloudfunctions/' + name + '/index.js')
      .then(function (r) { return r.text(); })
      .then(function (t) { $(elId).textContent = t; })
      .catch(function (e) { $(elId).textContent = '// 源码加载失败：' + e; });
  }

  function fillRouteSelect() {
    var sel = $('ck-route');
    sel.innerHTML = '';
    dataset.routes.forEach(function (rt) {
      var o = document.createElement('option');
      o.value = rt.id; o.textContent = rt.title;
      sel.appendChild(o);
    });
    sel.onchange = fillSpotSelect;
    fillSpotSelect();
  }

  function fillSpotSelect() {
    var rid = $('ck-route').value;
    var route = dataset.routes.filter(function (r) { return r.id === rid; })[0];
    var sel = $('ck-spot');
    sel.innerHTML = '';
    if (!route) return;
    route.spot_ids.forEach(function (sid) {
      var s = spotsById[sid];
      if (!s) return;
      var o = document.createElement('option');
      o.value = sid; o.textContent = s.name + '（' + s.city + '）';
      sel.appendChild(o);
    });
    sel.onchange = syncCity;
    syncCity();
  }

  function syncCity() {
    var sid = $('ck-spot').value;
    var s = spotsById[sid];
    $('ck-city').value = s ? s.city : '';
  }

  function renderData() {
    $('kv-openid').innerHTML = '当前模拟 openid：<b>' + getOpenid() + '</b>';
    $('res-data').textContent = pretty({
      checkins: getCheckins(),
      collections: getCollections()
    });
  }

  function setupTabs() {
    var tabs = document.querySelectorAll('.tab');
    tabs.forEach(function (t) {
      t.onclick = function () {
        document.querySelectorAll('.tab').forEach(function (x) { x.classList.remove('active'); });
        document.querySelectorAll('.panel').forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
        var name = t.getAttribute('data-tab');
        if (name === 'data') { $('p-data').classList.add('active'); renderData(); }
        else { $('p-' + name).classList.add('active'); }
      };
    });
  }

  function init() {
    setupTabs();
    loadSource('getRoutes', 'src-getRoutes');
    loadSource('checkin', 'src-checkin');
    loadSource('stats', 'src-stats');

    $('btn-getRoutes').onclick = function () { $('res-getRoutes').textContent = pretty(apiGetRoutes()); };
    $('btn-stats').onclick = function () { $('res-stats').textContent = pretty(apiStats()); };
    $('btn-checkin').onclick = function () {
      var r = apiCheckin($('ck-route').value, $('ck-spot').value, $('ck-city').value);
      $('res-checkin').textContent = pretty(r);
    };
    $('btn-reset').onclick = function () {
      if (confirm('确定清空本地打卡/收集数据？')) {
        setCheckins([]);
        setCollections({ openid: getOpenid(), unlockedSpotIds: [] });
        $('res-stats').textContent = '// 已重置，去「打卡」页重新打点';
        renderData();
      }
    };

    loadDataset(fillRouteSelect);
    renderData();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
