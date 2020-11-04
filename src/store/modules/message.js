import config from '@/config'

const message = {
  namespaced: true,
  state: {
    msgWebSock: null,
    unreadHistoryMsg: [],
    allUnreadMsgCount: 0,
    chatToList: []
  },
  getters: {
    getMsgWebSock(state) {
      return state.msgWebSock
    },
    getAllUnreadMsgCount(state) {
      return state.allUnreadMsgCount
    },
    getUnreadHistoryMsg(state) {
      return state.unreadHistoryMsg
    }
  },
  mutations: {
    initMsgWebSock(state) {
      const user = JSON.parse(localStorage.getItem("activeUser"))
      const msgWebSock = new WebSocket(`${config.wsUri}/push/${user.userId}`)
      msgWebSock.onopen = onOpen
      msgWebSock.onclose = onClose
      msgWebSock.onerror = onError
      state.msgWebSock = msgWebSock
    },
    webSockOnMessage(state) {
      state.msgWebSock.onmessage = (e) => {
        const msg = JSON.parse(e.data)
        // 判断是否是心跳检测数据
        if (msg.from === 0 && msg.content === 'pong') {

        } else if (msg.from === -2) {
          const list = JSON.parse(msg.content)
          for (let i of list) {
            handleHistoryMsg(i, state)
          }
        } else if (msg.from !== 0) {
          handleHistoryMsg(msg, state)
        }
      }
    },
    closeMsgWebSock(state) {
      if (state.msgWebSock) {
        state.msgWebSock.close()
      }
    },
    readOfflineMsg(state, name) {
      for (let msg of state.unreadHistoryMsg) {
        if (msg.name === name) {
          msg.msgList = []
          state.allUnreadMsgCount -= msg.unreadCount
          msg.unreadCount = 0
        }
      }
    }
  },
  actions: {}
}

const handleHistoryMsg = (msg, state) => {
  let hasUser = false
  for (let unreadMsg of state.unreadHistoryMsg) {
    if (unreadMsg.fromId === msg.from && unreadMsg.name === msg.name) {
      unreadMsg.msgList.push(msg)
      unreadMsg.unreadCount++
      hasUser = true
      break
    }
  }

  if (!hasUser) {
    let unreadMsg = {
      name: msg.name,
      fromId: msg.from,
      msgList: [msg],
      unreadCount: 1
    }

    state.unreadHistoryMsg.push(unreadMsg)
  }
  state.allUnreadMsgCount++
}

// ws连接开启
const onOpen = () => {
  console.log('Push Chat websocket connection open')
}

// ws连接关闭
const onClose = () => {
  console.log('Push Chat websocket connection close')
}

// ws连接出错
const onError = (e) => {
  console.error('Push Chat websocket connection', e)
}

export default message
