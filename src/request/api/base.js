const host = {
  dev1: '192.168.0.103:8081',
  dev2: '192.168.0.122:8081',
}

const base = {
  dev: 'http://' + host.dev1 + '/api',
  wsDev: 'ws://' + host.dev1,
}

export default base
