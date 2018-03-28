import UUID from 'uuid'
import React from 'react'
import { Text, View, PanResponder, LayoutAnimation } from 'react-native'

const colors = [
  '#CDC1B4', '#F44336', '#E91E63', '#9C27B0',
  '#673AB7', '#3F51B5', '#2196F3', '#03A9F4',
  '#00BCD4', '#009688', '#4CAF50', '#8BC34A',
  '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
  '#FF5722', '#000000'
]

const getKey = () => UUID.v4()

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      list: [],
      loading: false
    }

    this.score = 0

    this.update = (list) => {
      LayoutAnimation.configureNext({
        duration: 225,
        update: {
          type: 'easeIn'
        }
      })

      const poses = Array.from({ length: 16 }).map((v, i) => i).filter(v => list.findIndex(l => l.pos === v) === -1)
      const newG = { pos: 0, level: 0, key: getKey() }
      if (poses.length) {
        newG.pos = poses[Math.floor(Math.random() * poses.length)]
        this.setState({ list, loading: true }, () => {
          list.push(newG)
          setTimeout(() => this.setState({ list: list.filter(l => l.level > -1), loading: false }), 225)
        })
      }
    }

    this.change = (args) => {
      const { sortFunc, shouldMove, posChange } = args
      const list = [...this.state.list].filter(a => a.level > -1).sort(sortFunc)
      for (let i = 0; i < list.length; i++) {
        let { level, pos, key } = list[i]
        while (shouldMove(pos)) { // should move or not
          const index = list.findIndex(x => x.pos === pos + posChange)
          if (index === -1) { // no item in right
            pos += posChange
          } else {
            if (list[index].level === level) { // merge
              this.score += Math.pow(2, level + 2)
              list[index].level += 1
              level = -100
              pos += posChange
            }
            break
          }
        }
        Object.assign(list[i], { level, pos, key })
      }
      this.update([...this.state.list])
    }

    /* cathc key action */
    this.keyDown = (e) => {
      if (this.state.loading) return
      let args = null
      switch (e.key) {
        case 'ArrowUp':
          args = {
            sortFunc: (a, b) => a.pos - b.pos,
            shouldMove: p => (p / 4 >= 1),
            posChange: -4
          }
          break
        case 'ArrowDown':
          args = {
            sortFunc: (a, b) => b.pos - a.pos,
            shouldMove: p => (p / 4 < 3),
            posChange: 4
          }
          break
        case 'ArrowLeft':
          args = {
            sortFunc: (a, b) => (a.pos % 4) - (b.pos % 4),
            shouldMove: p => (p % 4 > 0),
            posChange: -1
          }
          break
        case 'ArrowRight':
          args = {
            sortFunc: (a, b) => (b.pos % 4) - (a.pos % 4),
            shouldMove: p => (p % 4 < 3),
            posChange: 1
          }
          break
        default:
          break
      }
      if (args) this.change(args)
    }

    this.keyUp = e => null

    this.getSize = () => {
      // const w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
      const w = 376
      return Math.min(Math.max(40, w / 4 - 32), 100)
    }
  }

  componentWillMount() {
    /* bind keydown event */
    /*
    document.addEventListener('keydown', this.keyDown)
    document.addEventListener('keyup', this.keyUp)
    document.addEventListener('touchstart', (e) => console.log('touchstart', e))
    document.addEventListener('touchmove', (e) => console.log('touchmove', e))
    document.addEventListener('touchend', (e) => console.log('touchend', e))
    */
    // this.update(Array.from({ length: 15}).map((v, i) => ({ level: 15 - i, pos: i, key: getKey() })))
    this.update([])
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        this._top = this.state.top
        this._left = this.state.left
        this.setState({ bg: 'red' })
      },
      onPanResponderMove: (evt, gs) => {
        if (this.type) return
        let type = ''
        const dst = 16
        if (gs.dx > dst && gs.dx > gs.dy && gs.dx > -gs.dy) type = 'ArrowRight'
        if (gs.dx < -dst && gs.dx < gs.dy && gs.dx < -gs.dy) type = 'ArrowLeft'
        if (gs.dy > dst && gs.dy > gs.dx && gs.dy > -gs.dx) type = 'ArrowDown'
        if (gs.dy < -dst && gs.dy < gs.dx && gs.dy < -gs.dx) type = 'ArrowUp'
        if (type) {
          this.type = type
          this.keyDown({ key: type })
        }
      },
      onPanResponderRelease: (evt, gs) => {
        this.type = null
      }
    })
  }

  componentWillUnmount() {
    /* remove keydown event */
    // document.removeEventListener('keydown', this.keyDown)
    // document.removeEventListener('keyup', this.keyUp)
  }

  renderGrid({ pos, level, key }) {
    const size = this.getSize()
    const color = colors[level + 1]
    const top = 16 + Math.floor(pos / 4) * (size + 16)
    const left = 16 + (pos % 4) * (size + 16)
    const text = level > -1 ? Math.pow(2, level + 1) : ''
    return (
      <View
        key={key.toString()}
        style={{
          position: 'absolute',
          top: top || 0,
          left: left || 0,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: 16,
          zIndex: level + 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Text> {text} </Text>
      </View>
    )
  }

  render() {
    const size = this.getSize()
    return (
      <View
        {...this._panResponder.panHandlers}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: '#faf8ef',
          display: 'flex',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        <View style={{ margin: 24 }}>
          <View style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
            <View style={{ width: 200, backgroundColor: '#BDBDBD', display: 'flex', alignItems: 'center' }}>
              <Text style={{ fontSize: 40 }}>
                { '2048' }
              </Text>
            </View>
            <View style={{ flexGrow: 1 }} />
            <View style={{ width: 96, backgroundColor: 'grey', borderRadius: 8 }}>
              <View style={{ margin: 8 }}>
                <Text style={{ textAlign: 'center' }}> {'SCORE'} </Text>
              </View>
              <View style={{ marginTop: -4, marginBottom: 4 }}>
                <Text style={{ textAlign: 'center' }}> {this.score} </Text>
              </View>
            </View>
          </View>
          <View style={{ height: 36 }} />
          <View style={{ width: 4 * size + 80, height: 4 * size + 80, backgroundColor: '#BBADA0', padding: 8, position: 'relative', borderRadius: 12 }} key="container">
            { Array.from({ length: 16 }).map((v, i) => this.renderGrid({ level: -1, pos: i, key: getKey() })) }
            { this.state.list.length ? this.state.list.map(l => this.renderGrid(l)) : <Text /> }
          </View>
        </View>
      </View>
    )
  }
}

export default App
