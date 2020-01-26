<template>
  <div class="container" ref="container">
    <div class="top" v-bind:style="{ width: windowWidth*0.98 + 'px' }">
      <Card :bordered="false" v-bind:style="{ width: windowWidth*0.98 + 'px' }">
        <div slot="title">
          <Row type="flex" justify="start" align="middle">
            <Col span="22"><p>基金APP信息</p></Col>
            <Col span="2">
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
          <Row type="flex" justify="center" align="middle">
            <Col span="22"><p>APP路径配置信息</p></Col>
            <Col span="2">
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
  import {setQueryConditions} from '../../libs/util.js'
  import {getAllApplicationShop} from "../../api/applicationShop";

  export default {
    components: {
      apkExpand,
      super_table
    },
    data() {
      return {
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
            title: '创建者',
            width: '100',
            render: (h, params) => {
              let createUser = params.row.createUserId
              if (params.row.createUserId === 0) {
                createUser = '系统'
              }
              return h('p', createUser)
            }
          },
          {
            title: '应用商店',
            key: 'marketName',
            width: '150',
            filter: {
              type: 'Input'
            }
          },
          {
            title: '基金APP',
            key: 'apkName',
            width: '150',
            filter: {
              type: 'Input'
            }
          },
          {
            title: '根路径',
            key: 'rootPath',
            width: '450'
          },
          {
            title: '子路径',
            width: '450',
            key: 'itemPath'
          },
          {
            title: '创建时间',
            width: '165',
            key: 'createTime'
          },
          {
            title: '最近更新时间',
            key: 'updateTime',
            width: '165'
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
        appData: []
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
    },
    watch: {
      currentAppPathPage() {
        this.getAppPathData({
          page: this.currentAppPathPage - 1,
          count: this.countPerPage
        })
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
          this.getAppPathData({page: this.currentAppPathPage - 1, count: this.countPerPage})
          return
        }
        this.currentAppPathPage = 1
        this.appPathConditions = []
        setQueryConditions(keys, search, this.appPathConditions)
        this.getAppPathData({
          page: 0,
          count: this.countPerPage,
          conditions: this.appPathConditions
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
        const that = this;
        that.isAppPathLoading = true
        if (currentRow.id === '' || currentRow.id === 0) {
          that.appPathData = []
          that.isAppPathLoading = false
          return
        }
        this.currentAppPathPage = 1
        getAppPaths({
          "page": 0,
          "count": this.countPerPage,
          "conditions": [{
            "query": "app_id",
            "queryString": currentRow.id
          }]
        }).then(res => {
          that.appPathDataCount = res.data.data.size
          that.appPathData = res.data.data.data
          that.isAppPathLoading = false
        })
      },
      createOrUpdateAppPath(currentRow) {
        var that = this
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
          title: '设置APP路径',
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
          this.getAppPathData({page: this.currentAppPathPage - 1, count: this.countPerPage})
          this.$message.success("操作成功")
        })
      },
      onApkMessageDoubleClick(currentRow) {
        var that = this
        this.currentApkMessageData = currentRow
        this.$Modal.confirm({
          title: '修改基金Apk信息',
          render: (h, params) => {
            return h('span', [
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
