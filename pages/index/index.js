// index.js
// 获取应用实例
const app = getApp()
const REQUEST_URL = app.globalData.REQUEST_URL

Page({
  data: {
    functions: ['智能调整曝光', '图像构成分析', '图像质量评分', '图像清晰度增强', '图像色彩增强'],
    index: 0,
    loading: false
  },
  formatBase64(url, base64) {
    const suffix = url.substring(url.lastIndexOf('.') + 1)
    return 'data:image/' + suffix + ';base64,' + base64
  },
  chooseImage() {
    if (this.data.loading) {
      wx.showToast({
        title: '正在处理中，请稍后',
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
          preview: res.tempFilePaths[0]
        })
      }
    })
  },
  handleImage() {
    if (!this.data.preview) {
      wx.showToast({
        title: '请先选取素材图片',
        icon: 'none'
      })
      return
    }
    if (this.data.loading) {
      wx.showToast({
        title: '正在处理中，请稍后',
        icon: 'none'
      })
      return
    }
    this.setLoading(true)
    switch (this.data.index) {
      case 0: // 智能调整曝光
        this.enhanceContrast()
        break
      case 1: // 图像构成分析
        this.analyzeLabel()
        break
      case 2: // 图像质量评分
        this.checkQuality()
        break
      case 3: // 图像清晰度增强
        this.enhanceDefinition()
        break
      case 4:
        this.enhanceColor()
        break
      default:
        break
    }
  },
  previewSourceImage() {
    if (!this.data.preview) return
    wx.previewImage({
      urls: [this.data.preview]
    })
  },
  previewImage(e) {
    if (!e.currentTarget.dataset.url) return
    wx.previewImage({
      urls: [this.data.preview, e.currentTarget.dataset.url],
      current: e.currentTarget.dataset.url
    })
  },
  pickerChange(e) {
    this.setData({
      index: Number(e.detail.value)
    })
  },
  enhanceContrast() {
    wx.uploadFile({
      filePath: this.data.preview,
      name: 'file',
      url: `${REQUEST_URL}/handler`,
      success: res => {
        const data = JSON.parse(res.data)
        this.setData({
          targetContrastImage: this.formatBase64(this.data.preview, data.data.image)
        })
      },
      fail: error => {
        this.showErrorMessage()
      },
      complete: () => {
        this.setLoading(false)
      }
    })
  },
  analyzeLabel() {
    wx.uploadFile({
      filePath: this.data.preview,
      name: 'file',
      url: `${REQUEST_URL}//analyze`,
      success: res => {
        const data = JSON.parse(res.data)
        this.setData({
          labels: data.data.Labels
        })
      },
      fail: error => {
        this.showErrorMessage()
      },
      complete: () => {
        this.setLoading(false)
      }
    })
  },
  setLoading(loading) {
    this.setData({
      loading: loading
    })
  },
  checkQuality() {
    wx.uploadFile({
      filePath: this.data.preview,
      name: 'file',
      url: `${REQUEST_URL}/quality`,
      success: res => {
        const data = JSON.parse(res.data)
        this.setData({
          'quality.definition': data.data.ClarityScore,
          'quality.beauty': data.data.AestheticScore
        })
      },
      fail: error => {
        this.showErrorMessage()
      },
      complete: () => {
        this.setLoading(false)
      }
    })
  },
  enhanceDefinition() {
    wx.uploadFile({
      filePath: this.data.preview,
      name: 'file',
      url: `${REQUEST_URL}/high`,
      success: res => {
        const data = JSON.parse(res.data)
        console.log(data)
        this.setData({
          targetDefinitionImage: this.formatBase64(this.data.preview, data.data.image)
        })
      },
      fail: error => {
        this.showErrorMessage()
      },
      complete: () => {
        this.setLoading(false)
      }
    })
  },
  enhanceColor() {
    wx.uploadFile({
      filePath: this.data.preview,
      name: 'file',
      url: `${REQUEST_URL}/color`,
      success: res => {
        const data = JSON.parse(res.data)
        console.log(data)
        this.setData({
          targetColorImage: this.formatBase64(this.data.preview, data.data.image)
        })
      },
      fail: error => {
        this.showErrorMessage()
      },
      complete: () => {
        this.setLoading(false)
      }
    })
  },
  showErrorMessage() {
    wx.showToast({
      title: '处理失败请重试',
      icon: 'error'
    })
  },
  onLoad() {

  }
})