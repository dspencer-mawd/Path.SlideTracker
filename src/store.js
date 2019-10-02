import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    arTableFields: ['Run', 'Cases', 'Blocks', 'Slides'],
    arTableItems: [],
    arSlideDetailsTableFields: ['Marked_Ready_for_Courier', 'Slide_ID', 'Stain', 'Slide_Tray'],
    arSlideDetailsTableItems: [],
    apitoken: 'token',
    //  Prod
    //  apiURL: 'http://10.24.4.9:2081',
    //  Test
    //  apiURL: 'http://10.24.4.9:2082',
    //  Local Test
    //  apiURL: 'http://localhost:2081',
    //  Prod URL
    apiURL: 'http://23.228.166.87:2083',
    strSlideDistLoc: null

  },
  mutations: {
    ClearArTableItems (state) {
      state.arTableItems = []
    },
    ClearStrSlideDistLoc (state) {
      state.strSlideDistLoc = null
    },
    PushArTableItems (state, objTmp) {
      state.arTableItems.push(objTmp)
    },
    ClearArSlideDetailsTableItems (state) {
      state.arSlideDetailsTableItems = []
    },
    PushArSlideDetailsTableItems (state, objTmp) {
      state.arSlideDetailsTableItems.push(objTmp)
    },
    SetStrSlideDistLoc (state, objTmp) {
      state.strSlideDistLoc = objTmp
    }
  },
  actions: {
    LoadCaseBlockSlideCountTableData ({ commit }, strLocationHash) {
      return new Promise((resolve, reject) => {
        let strFullAPICall = this.state.apiURL + '/caseblockslidecount'
        console.log('Hello LoadBlockCountTableData')
        console.log(strFullAPICall)
        console.log('APIHash')
        console.log(strLocationHash)
        axios.post(strFullAPICall, {
          URLHASH: strLocationHash,
          apitoken: this.state.apitoken
        })
          .then(function (response) {
            // Clear table data
            commit('ClearArTableItems')
            commit('ClearStrSlideDistLoc')
            commit('SetStrSlideDistLoc', String(response.data[0]).replace('LOCN', ''))

            let temp = {}
            temp = response.data

            // Run 1
            commit('PushArTableItems', { isActive: false, Run: 1, Cases: temp[1][0].FirstRunCaseCount, Blocks: temp[2][0].FirstRunBlockCount, Slides: temp[3][0].FirstRunSlideCount })
            // Run 2
            commit('PushArTableItems', { isActive: false, Run: 2, Cases: temp[4][0].SecondRunCaseCount, Blocks: temp[5][0].SecondRunBlockCount, Slides: temp[6][0].SecondRunSlideCount })
            // Run 3
            commit('PushArTableItems', { isActive: false, Run: 3, Cases: temp[7][0].ThirdRunCaseCount, Blocks: temp[8][0].ThirdRunBlockCount, Slides: temp[9][0].ThirdRunSlideCount })
            // Run 4
            commit('PushArTableItems', { isActive: false, Run: 4, Cases: temp[10][0].FourthRunCaseCount, Blocks: temp[11][0].FourthRunBlockCount, Slides: temp[12][0].FourthRunSlideCount })
            // Total
            commit('PushArTableItems', { isActive: false, Run: 'All Runs', Cases: temp[13][0].TotalRunCaseCount, Blocks: temp[14][0].TotalRunBlockCount, Slides: temp[15][0].TotalRunSlideCount })
            resolve()
          })
          .catch(function (error) {
            console.log(error)
            reject(error)
          })
        console.log('promise done')
      })
    },
    LoadSlideDetailsTableData ({ commit }, strLocationHash) {
      console.log('Hello load slide details table Data')
      return new Promise((resolve, reject) => {
        let strFullAPICall = this.state.apiURL + '/caseblockslidecountdetails'
        console.log('Hello LoadBlockCountTableData')
        console.log(strFullAPICall)
        console.log(this.state.strSlideDistLoc)
        axios.post(strFullAPICall, {
          SLIDEDISTLOCID: this.state.strSlideDistLoc,
          apitoken: this.state.apitoken
        })
          .then(function (response) {
            // Clear table data
            commit('ClearArSlideDetailsTableItems')
            console.log('Response:')
            console.log(response)
            // strResponseJSON = response.data[0].FirstRunCaseCount
            let temp = {}
            temp = response.data

            for (var i = 0; i < response.data.length; i++) {
              let strSlideID = temp[i].SlideID
              let strSlideTray = temp[i].SlideTray
              let dtRdyForCourier = new Date(temp[i].DTReadyForCourier)
              let intMinutes = dtRdyForCourier.getMinutes()
              let strMinutes = ''
              if (intMinutes <= 9) {
                strMinutes = '0' + intMinutes
              } else {
                strMinutes = intMinutes
              }
              // let strFormattedDate = dtRdyForCourier.format('hh:mm mm/dd/yy')
              let strFormattedDate = (dtRdyForCourier.getMonth() + 1) + '-' + dtRdyForCourier.getDate() + '-' + dtRdyForCourier.getFullYear() + ' ' + dtRdyForCourier.getHours() + ':' + strMinutes
              console.log(strFormattedDate)
              // let strDTReadyForCourier = temp[i].DTReadyForCourier
              strSlideID = strSlideID.replace('HSLD', '')
              strSlideTray = strSlideTray.replace('SLTR', '')

              // commit('PushArSlideDetailsTableItems', { isActive: false, Marked_Ready_for_Courier: temp[i][0].FirstRunCaseCount, Slide_ID: temp[i][0].FirstRunCaseCount, Stain: temp[2][0].FirstRunBlockCount, Slide_Tray: temp[3][0].FirstRunSlideCount })
              commit('PushArSlideDetailsTableItems', { isActive: false, Marked_Ready_for_Courier: strFormattedDate, Slide_ID: strSlideID, Stain: temp[i].StainLabel, Slide_Tray: strSlideTray })
              // console.log(i)
            } // end for
            resolve()
          })
          .catch(function (error) {
            console.log(error)
            reject(error)
          })
      })
    }
  },
  getters: {
    TableFields: (state, getters) => {
      return state.arTableFields
    },
    TableItems: (state, getters) => {
      return state.arTableItems
    },
    SlideDetailsTableFields: (state, getters) => {
      return state.arSlideDetailsTableFields
    },
    SlideDetailsTableItems: (state, getters) => {
      return state.arSlideDetailsTableItems
    },
    SlideDistLoc: (state, getters) => {
      return state.strSlideDistLoc
    }
  },
  functions: {
    appendLeadingZeroes (n) {
      if (n <= 9) {
        return '0' + n
      }
      return n
    }
  }
})
