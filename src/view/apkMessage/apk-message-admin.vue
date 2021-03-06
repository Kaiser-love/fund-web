<template>
  <div class="container" ref="container">
    <div class="top" v-bind:style="{ width: windowWidth*0.98 + 'px' }">
      <Card :bordered="false" v-bind:style="{ width: windowWidth*0.98 + 'px' }">
        <div slot="title">
          <Row>
            <Col style="float:left"><p>基金APP信息</p></Col>
            <Col style="float:right;display: inline;">
              <Button type="primary" @click="apkDataReload">刷新</Button>
            </Col>
          </Row>
        </div>
        <super_table :pageSize="countPerPage" @onSearch="onApkSearch" @onClick="onAppMessageClick"
                     @onDoubleClick="onApkMessageDoubleClick"
                     :current.sync="currentApkPage" :data="apkData" :columns="apkDataColumns"
                     :isLoading="isApkLoading" :dataNum="apkDataCount"></super_table>
      </Card>
    </div>
    <div class="bottom">
      <Card :bordered="false" v-bind:style="{ width: windowWidth*0.98 + 'px' }">
        <div slot="title">
          <Row>
            <Col style="float:left"><p>APP路径配置信息</p></Col>
            <Col style="float:right;display: inline;">
              <Button type="primary" @click="createOrUpdateAppPath">添加配置</Button>
              <Button type="primary" @click="appPathDataReload" style="margin-left: 10px">刷新</Button>
            </Col>
          </Row>
        </div>
        <super_table :pageSize="countPerPage"
                     @onSearch="onAppPathSearch"
                     @onDoubleClick="createOrUpdateAppPath"
                     :current.sync="currentAppPathPage"
                     :data="appPathData" :columns="appPathColumns" :isLoading="isAppPathLoading"
                     :dataNum="appPathDataCount"></super_table>
      </Card>
    </div>
  </div>

</template>


<script>
  import apkExpand from '../../components/table/apk-expand.vue'
  import super_table from '@/components/table/supertable.vue'
  import {deleteAppPath, getAppPaths, createOrUpdateAppPath} from '../../api/appPath'
  import {createOrUpdateApkMessage, deleteApkMessage, getAllApkMessage} from '../../api/apkMessage'
  import {setQueryConditions, downloadByBlob} from '../../libs/util.js'
  import {getAllApplicationShop} from "../../api/applicationShop";
  import {getEnumTypes} from "../../api/metaApi";

  export default {
    components: {
      apkExpand,
      super_table
    },
    data() {
      return {
        ocrTypeList: [
          {
            code: '0',
            desc: '百度OCR识别'
          },
          {
            code: '1',
            desc: '基于端到端的OCR文字识别模型'
          },
          {
            code: '2',
            desc: 'tesseract开源识别库'
          }
        ],
        apkSearchState: 0,
        appPathSearchState: 0,
        apkSearchData: {},
        appPathSearchData: {},
        currentAppPathData: {},
        currentApkMessageData: {},
        windowWidth: 0,
        isAppPathLoading: false,
        isApkLoading: false,
        appPathDataCount: 0,
        apkDataCount: 0,
        countPerPage: 5,
        appPathData: [],
        appPathColumns: [
          {
            type: 'index',
            width: 75,
            align: 'center',
            indexMethod: (row) => {
              return row._index + 1 + (this.currentAppPathPage - 1) * this.countPerPage
            }
          },
          {
            title: "ID",
            key: 'id',
            width: 100,
            align: 'center',
            filter: {
              type: 'Input'
            }
          },
          {
            title: '创建者',
            width: 75,
            key: 'createUserName',
            filter: {
              type: 'Input'
            }
          },
          {
            title: '应用商店',
            key: 'marketName',
            filter: {
              type: 'Input'
            }
          },
          {
            title: '基金APP',
            key: 'apkName',
            filter: {
              type: 'Input'
            }
          },
          {
            title: '根路径',
            key: 'rootPath',
            width: 150,
            render: (h, params) => {
              return h('div', [
                h('span', {
                  style: {
                    display: 'inline-block',
                    width: '95%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  },
                  domProps: {
                    title: params.row.rootPath
                  },
                  on: {
                    click: (e) => {
                      e.stopPropagation();
                    }
                  }
                }, params.row.rootPath)]);
            }
          },
          {
            title: '子路径',
            key: 'itemPath',
            width: 150,
            render: (h, params) => {
              return h('div', [
                h('span', {
                  style: {
                    display: 'inline-block',
                    width: '95%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  },
                  domProps: {
                    title: params.row.itemPath
                  },
                  on: {
                    click: (e) => {
                      e.stopPropagation();
                    }
                  }
                }, params.row.itemPath)]);
            }
          },
          {
            title: '创建时间',
            key: 'createTime'
          },
          {
            title: '最近更新时间',
            key: 'updateTime',
          },
          {
            title: '上次执行状态',
            key: 'executeState',
            filter: {
              type: 'Input'
            },
            width: '140',
            render: (h, params) => {
              const row = params.row
              return h('i-switch', {
                props: {
                  value: row.executeState === 1,
                  size: 'large',
                  disabled: true
                },
              }, [
                h('span', {
                  slot: 'open'
                }, '正常'),
                h('span', {
                  slot: 'close'
                }, '异常')
              ])
            }
          },
          {
            title: '状态',
            key: 'state',
            filter: {
              type: 'Input'
            },
            width: '140',
            render: (h, params) => {
              const row = params.row
              return h('i-switch', {
                props: {
                  value: row.state === 1,
                  size: 'large',
                  disabled: this.stateDisable
                },
                on: {
                  'on-change': (val) => {
                    this.stateDisable = true
                    if (val) {
                      params.row.state = 1
                    } else {
                      params.row.state = 0
                    }
                    createOrUpdateAppPath(params.row).then(res => {
                      params.row.state = res.data.data.state
                      this.$Message.success("修改成功")
                    }).finally(() => this.stateDisable = false)
                  }
                }
              }, [
                h('span', {
                  slot: 'open'
                }, '启用'),
                h('span', {
                  slot: 'close'
                }, '禁用')
              ])
            }
          },
          {
            title: '操作',
            key: 'action',
            width: '100',
            align: 'center',
            render: (h, params) => {
              let dzcListItem = [
                h('DropdownItem', {
                  nativeOn: {
                    click: (name) => {
                      this.$Modal.info({
                        title: '根路径配置',
                        width: 850,
                        okText: "关闭",
                        scrollable: true,
                        closable: true,
                        content: `${params.row.rootPath}`
                      })
                    }
                  }
                }, '查看根路径配置'),
                h('DropdownItem', {
                  nativeOn: {
                    click: (name) => {
                      this.$Modal.info({
                        title: '子路径配置',
                        width: 850,
                        okText: "关闭",
                        scrollable: true,
                        closable: true,
                        content: `${params.row.itemPath.split("\n").join("<br>")}`
                      })
                    }
                  }
                }, '查看子路径配置'),
                h('DropdownItem', {
                  nativeOn: {
                    click: (name) => {
                      this.$Modal.info({
                        title: '异常日志',
                        width: 850,
                        okText: "关闭",
                        scrollable: true,
                        closable: true,
                        content: `${params.row.exception}`
                      })
                    }
                  }
                }, '查看异常日志'),
              ]
              return h('div', [
                h('Dropdown', {
                  props: {
                    trigger: 'click',
                    transfer: true
                  }
                }, [
                  h('Button', {
                    style: {
                      marginRight: '5px'
                    },
                    props: {
                      type: 'primary',
                      size: 'small'
                    }
                  }, '操作'),
                  h('DropdownMenu', {
                    slot: 'list'
                  }, dzcListItem)
                ]),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  style: {
                    margin: '2px'
                  },
                  on: {
                    'click': (event) => {
                      event.stopPropagation()
                      let temp = this.appPathData.find(function (item) {
                        return item.id === params.row.id
                      })
                      this.removeAppPath(temp.id)
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],
        stateDisable: false,
        apkData: [],
        apkDataColumns: [
          {
            type: 'expand',
            width: 40,
            render: (h, params) => {
              return h(apkExpand, {
                props: {
                  row: params.row
                }
              })
            }
          },
          {
            title: '图标',
            key: 'iconUrl',
            render: (h, params) => {
              return h('div', [
                h('span', {
                  style: {
                    display: 'inline-block',
                    width: '30px',
                    height: '30px',
                    background: 'url(' + params.row.iconUrl + ')',
                    backgroundSize: '100% 100%',
                    borderRadius: '15px',
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: '提示',
                        content: '确定要下载此Apk图标吗?',
                        onOk: function () {
                          downloadByBlob(params.row.iconUrl, params.row.apkName + "图标.png");
                        }
                      })
                    }
                  }
                }, '')
              ]);
            }
          },
          {
            title: '应用商店',
            key: 'marketName',
            filter: {
              type: 'Input'
            }
          },
          {
            title: 'APK名称',
            key: 'apkName',
            filter: {
              type: 'Input'
            }
          },
          {
            title: 'ocr检测方式',
            key: 'ocrTypeDesc',
            filter: {
              type: 'Input'
            }
          },
          {
            title: 'appActivity',
            key: 'appActivity'
          },
          {
            title: 'apkPackageName',
            key: 'apkPackageName'
          },
          {
            title: 'APK安装包保存路径',
            key: 'path'
          },
          {
            title: 'APK截图保存路径',
            key: 'imgPath'
          },
          {
            title: '操作',
            key: 'action',
            width: '200',
            align: 'center',
            render: (h, params) => {
              let dzcListItem = [
                h('DropdownItem', {
                  nativeOn: {
                    click: (name) => {
                      this.$Message.info('发送获取计量数据命令')
                    }
                  }
                }, '获取计量数据'),
                h('DropdownItem', {
                  nativeOn: {
                    click: (name) => {
                      this.$Message.info('发送获取电子秤电量命令')
                    }
                  }
                }, '获取电子秤电量'),
                h('DropdownItem', {
                  nativeOn: {
                    click: (name) => {
                      this.$Message.info('发送清空计量数据命令')
                    }
                  }
                }, '清空计量数据')
              ]
              return h('div', [
                h('Dropdown', {
                  props: {
                    trigger: 'click',
                    transfer: true
                  }
                }, [
                  h('Button', {
                    style: {
                      marginRight: '5px'
                    },
                    props: {
                      type: 'primary',
                      size: 'small'
                    }
                  }, '操作'),
                  h('DropdownMenu', {
                    slot: 'list'
                  }, dzcListItem)
                ]),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  style: {
                    margin: '2px'
                  },
                  on: {
                    'click': (event) => {
                      event.stopPropagation()
                      let temp = this.apkData.find(function (item) {
                        return item.id === params.row.id
                      })
                      this.removeApk(temp.id)
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],
        currentAppPathPage: 1,
        currentApkPage: 1,
        apkConditions: [],
        appPathConditions: [],
        applicationShopData: [],
        appData: [],
        hasClickUp: false,
        hasClickUpConditions: []
      }
    },
    mounted() {
      var that = this
      this.$nextTick(() => {
        this.windowWidth = this.$refs.container.offsetWidth
      })
      window.onresize = function () {
        that.windowWidth = that.$refs.container.offsetWidth
      }
    },
    created() {
      this.currentAppPathPage = 1
      this.currentApkPage = 1
      this.getApkMessageData({
        page: this.currentApkPage - 1,
        count: this.countPerPage
      })
      this.getAppPathData({
        page: this.currentAppPathPage - 1,
        count: this.countPerPage
      })
      getAllApplicationShop({page: 0, count: 100}).then(res => {
        this.applicationShopData = res.data.data.data
      })
      getEnumTypes('ocrType').then(res => {
        this.ocrTypeList = res.data.data
      })
    },
    watch: {
      currentAppPathPage() {
        if (this.hasClickUp) {
          this.isAppPathLoading = true
          let getHashClickUpDataCondition = this.hasClickUpConditions.concat(this.appPathConditions)
          this.getHasClickUpData(getHashClickUpDataCondition)
        } else {
          this.getAppPathData({
            page: this.currentAppPathPage - 1,
            count: this.countPerPage
          })
        }
      },
      currentApkPage() {
        this.getApkMessageData({
          page: this.currentApkPage - 1,
          count: this.countPerPage,
          conditions: this.apkConditions
        })
      }
    },
    computed: {},
    methods: {
      getAppPathData({page, count, conditions = []}) {
        var that = this
        that.isAppPathLoading = true
        getAppPaths({
          "page": page,
          "count": count,
          "conditions": conditions
        }).then(res => {
          const data = res.data.data.data
          that.appPathDataCount = res.data.data.size
          that.appPathData = data
          that.isAppPathLoading = false
        })
      },
      removeAppPath(id) {
        var that = this
        let dId = id
        this.$Modal.confirm({
          title: '警告',
          content: '该操作会导致配置数据永远从数据库移除，确定删除该配置吗？（非专业人员和维护人员请勿执行此操作）',
          onOk: function () {
            deleteAppPath(dId).then(res => {
              this.$message.success("删除成功")
              that.getAppPathData({
                page: that.currentAppPathPage - 1,
                count: that.countPerPage
              })
            })
          }
        })
      },
      removeApk(id) {
        var that = this
        let dId = id
        this.$Modal.confirm({
          title: '警告',
          content: '该操作会导致APK数据永远从数据库移除，确定删除该APK吗？（非专业人员和维护人员请勿执行此操作）',
          onOk: function () {
            deleteApkMessage(dId).then(res => {
              that.getApkMessageData({
                page: that.currentApkPage - 1,
                count: that.countPerPage,
                conditions: that.apkConditions
              })
            })
          }
        })
      },
      onApkSearch(search) {
        this.apkSearchData = search
        const keys = Object.keys(search)
        if (keys.length === 0) {
          this.apkSearchState = 0
          this.getApkMessageData({page: this.currentApkPage - 1, count: this.countPerPage})
          return
        }
        this.currentApkPage = 1
        this.apkConditions = []
        setQueryConditions(keys, search, this.apkConditions)
        this.getApkMessageData({
          page: 0,
          count: this.countPerPage,
          conditions: this.apkConditions
        })
        this.apkSearchState = 1
      },
      onAppPathSearch(search) {
        this.appPathSearchData = search
        const keys = Object.keys(search)
        if (keys.length === 0) {
          this.appPathSearchState = 0
          let getApkMessageDataCondition = []
          if (this.hasClickUp) {
            getApkMessageDataCondition = this.hasClickUpConditions
          }
          this.getAppPathData({
            page: this.currentAppPathPage - 1,
            count: this.countPerPage,
            conditions: getApkMessageDataCondition
          })
          return
        }
        this.currentAppPathPage = 1
        this.appPathConditions = []
        setQueryConditions(keys, search, this.appPathConditions)
        let getApkMessageDataCondition = this.appPathConditions
        if (this.hasClickUp) {
          getApkMessageDataCondition = this.hasClickUpConditions.concat(this.appPathConditions)
        }
        this.getAppPathData({
          page: 0,
          count: this.countPerPage,
          conditions: getApkMessageDataCondition
        })
        this.appPathSearchState = 1
      },
      getApkMessageData({page, count, conditions = []}) {
        this.apkSearchState = 0
        const that = this
        that.isApkLoading = true
        getAllApkMessage({page: page, count: count, conditions: conditions}).then(res => {
          const data = res.data.data.data
          that.apkDataCount = res.data.data.size
          that.apkData = data
          that.isApkLoading = false
        })
      },
      apkDataReload() {
        if (this.apkSearchState === 0) {
          this.getApkMessageData({
            page: this.currentAppPathPage - 1,
            count: this.countPerPage
          })
        } else {
          this.onApkSearch(this.apkSearchData)
        }
      },
      appPathDataReload() {
        this.hasClickUp = false
        this.hasClickUpConditions = []
        if (this.appPathSearchState === 0) {
          this.getAppPathData({
            page: this.currentAppPathPage - 1,
            count: this.countPerPage
          })
        } else {
          this.onAppPathSearch(this.appPathSearchData)
        }
      },
      onAppMessageClick(currentRow) {
        if (currentRow.id === '' || currentRow.id === 0) {
          this.appPathData = []
          this.isAppPathLoading = false
          return
        }
        this.isAppPathLoading = true
        this.hasClickUp = true
        this.appPathSearchState = false
        this.appPathSearchData = {}
        this.appPathConditions = []
        this.currentAppPathPage = 1
        this.hasClickUpConditions = [{
          "query": "app_id",
          "queryString": currentRow.id
        }]
        this.getHasClickUpData(this.hasClickUpConditions)
      },
      getHasClickUpData(conditions) {
        getAppPaths({
          "page": 0,
          "count": this.countPerPage,
          "conditions": conditions
        }).then(res => {
          this.appPathDataCount = res.data.data.size
          this.appPathData = res.data.data.data
          this.isAppPathLoading = false
        }).catch(() => {
          this.hasClickUp = false
          this.isAppPathLoading = false
          this.hasClickUpConditions = []
        })
      },
      createOrUpdateAppPath(currentRow) {
        const that = this;
        // 更新操作
        if (currentRow.altKey === undefined) {
          this.currentAppPathData = currentRow
          getAllApkMessage({
            page: 0,
            count: 9999,
            conditions: [{
              "query": "app_shop_id",
              "connection": "=",
              "queryString": this.currentAppPathData.appShopId
            }]
          }).then(res => {
            that.appData = res.data.data.data
          })
        } else {
          this.currentAppPathData.id = 0
        }
        this.$Modal.confirm({
          title: '新建App遍历路径',
          render: (h, params) => {
            return h('span', [
              h('p', '应用商店:'),
              h('Select', {
                  props: {
                    value: this.currentAppPathData.appShopId
                  },
                  on: {
                    'on-change': (val) => {
                      this.currentAppPathData.appShopId = val
                      getAllApkMessage({
                        page: 0,
                        count: 9999,
                        conditions: [{
                          "query": "app_shop_id",
                          "connection": "=",
                          "queryString": this.currentAppPathData.appShopId
                        }]
                      }).then(res => {
                        that.appData = res.data.data.data
                      })
                    }
                  }
                },
                that.applicationShopData.map((item) => {
                  return h('Option', {
                    props: {
                      value: item.id,
                      label: item.shopName
                    }
                  })
                })
              ),
              h('p', '基金App:'),
              h('Select', {
                  props: {
                    value: this.currentAppPathData.appId
                  },
                  on: {
                    'on-change': (val) => {
                      this.currentAppPathData.appId = val
                    }
                  }
                },
                that.appData.map((item) => {
                  return h('Option', {
                    props: {
                      value: item.id,
                      label: item.apkName
                    }
                  })
                })
              ),
              h('p', '根路径配置:'),
              h('Input', {
                props: {
                  placeholder: '输入根路径配置',
                  value: this.currentAppPathData.rootPath,
                  size: "large",
                  clearable: true,
                  type: "textarea",
                  autosize: true
                },
                on: {
                  'on-change': (event) => {
                    this.currentAppPathData.rootPath = event.target.value
                  }
                }
              }),
              h('p', '子路径配置:'),
              h('Input', {
                props: {
                  placeholder: '输入子路径配置',
                  value: this.currentAppPathData.itemPath,
                  size: "large",
                  clearable: true,
                  type: "textarea",
                  autosize: true
                },
                on: {
                  'on-change': (event) => {
                    this.currentAppPathData.itemPath = event.target.value
                  }
                }
              }),
            ])
          },
          onOk: () => {
            that.editOK()
          }
        })
      },
      editOK() {
        createOrUpdateAppPath(this.currentAppPathData).then(res => {
          this.getHasClickUpData(this.hasClickUpConditions)
          this.$message.success("操作成功")
        })
      },
      onApkMessageDoubleClick(currentRow) {
        const that = this;
        this.currentApkMessageData = currentRow
        this.$Modal.confirm({
          title: '修改基金Apk信息',
          render: (h, params) => {
            return h('span', [
              h('p', 'OCR检测方式:'),
              h('Select', {
                  props: {
                    size: "large",
                    value: this.currentApkMessageData.ocrType
                  },
                  on: {
                    'on-change': (val) => {
                      this.currentApkMessageData.ocrType = val
                    }
                  }
                },
                that.ocrTypeList.map((item) => {
                  return h('Option', {
                    props: {
                      value: item.code,
                      label: item.desc
                    }
                  })
                })
              ),
              h('p', 'Apk保存路径:'),
              h('Input', {
                props: {
                  placeholder: '输入Apk保存路径',
                  value: currentRow.path,
                  size: "large",
                  clearable: true,
                  type: "textarea",
                  autosize: true
                },
                on: {
                  'on-change': (event) => {
                    this.currentApkMessageData.path = event.target.value
                  }
                }
              }),
              h('p', 'Apk截图保存路径:'),
              h('Input', {
                props: {
                  placeholder: '输入Apk截图保存路径',
                  value: currentRow.imgPath,
                  size: "large",
                  clearable: true,
                  type: "textarea",
                  autosize: true
                },
                on: {
                  'on-change': (event) => {
                    this.currentApkMessageData.imgPath = event.target.value
                  }
                }
              }),
            ])
          },
          onOk: () => {
            that.editApkMessageOK()
          }
        })
      },
      editApkMessageOK() {
        createOrUpdateApkMessage(this.currentApkMessageData).then(res => {
          this.getApkMessageData({page: this.currentApkPage - 1, count: this.countPerPage})
          this.$message.success("操作成功")
        })
      }
    }

  }
</script>
<style>
  .container {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;
    align-content: center;
  }

  .top {
    flex-shrink: 1;
    display: flex;
  }

  .bottom {
    margin-top: 20px;
    flex-shrink: 1;
    display: flex;
  }
</style>
