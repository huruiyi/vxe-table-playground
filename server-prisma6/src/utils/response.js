function ok(res, data = null, msg = 'ok') {
  res.json({ code: 0, msg, data })
}

function fail(res, msg = 'error', code = 1, status = 200) {
  res.status(status).json({ code, msg, data: null })
}

module.exports = { ok, fail }
