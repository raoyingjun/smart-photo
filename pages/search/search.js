const REQUEST_URL = getApp().globalData.REQUEST_URL

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    page: 1,
    list: [''],
    previewList: [],
    noMore: false
  },
  previewSourceImage() {
    if (!this.data.preview) return
    wx.previewImage({
      urls: [this.data.preview]
    })
  },
  previewImage(e) {
    wx.previewImage({
      urls: this.data.previewList,
      current: e.currentTarget.dataset.url
    })
  },
  chooseImage() {
    if (this.data.loading) {
      wx.showToast({
        title: '正在搜图中，请稍后',
        icon: 'none'
      })
      return
    }
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        this.setData({
          preview: res.tempFilePaths[0],
          previewList: [],
          list: [],
          page: 1,
          noMore: false
        })
        this.getResultList()
      }
    })
  },
  getResultList() {
    if (this.data.noMore) return
    this.setData({
      loading: true
    })
    wx.uploadFile({
      filePath: this.data.preview,
      name: 'file',
      formData: {
        page: this.data.page
      },
      url: `${REQUEST_URL}/similar`,
      success: res => {
        const data = JSON.parse(res.data)
        const code = data.code
        if (code === 200) {
          const newList = this.objectToArray(data.data.photos)
          this.data.list.push.apply(this.data.list, newList)
          // 把图片对象数组，转换成字符穿数组 Array<Object> => Array<String>，供查看大图使用
          this.data.previewList.push.apply(this.data.previewList, newList.map(item => item.thumbnail_preview_src))
          this.setData({
            previewList: this.data.previewList,
            list: this.data.list,
            page: this.data.page + 1
          })
        } else {
          this.setData({
            noMore: true
          })
        }
      },
      fail: error => {
        wx.showToast({
          title: '加载失败请重试',
          icon: 'error'
        })
      },
      complete: () => {
        this.setData({
          loading: false
        })
      }
    })
  },
  objectToArray(object) {
    const arr = []
    for (const key in object) {
      if (object.hasOwnProperty(key)) arr.push(object[key])
    }
    return arr
  },
  onReachBottom() {
    this.getResultList()
  },
  onReady() {
    wx.showLoading({
      title: '正在初始化',
      mask: true
    })
    const query = wx.createSelectorQuery()
    query.select('.list-item').boundingClientRect()
    query.exec(rect => {
      this.setData({
        WIDTH: rect[0].width,
        list: []
      })
      wx.hideLoading()
    })
  }
})