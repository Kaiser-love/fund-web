<template>
  <div class="container" ref="container">
    <div class="top" v-bind:style="{ width: windowWidth*0.98 + 'px' }">
      <Card :bordered="false" v-bind:style="{ width: windowWidth*0.98 + 'px' }">
        <div slot="title">
          <Row>
            <Col style="float:left"><p>应用商店信息</p></Col>
            <Col style="float:right;display: inline;">
              <Button type="primary" @click="applicationDataReload">刷新</Button>
            </Col>
          </Row>
        </div>
        <super_table @onClick="onApplicationShopClick" :pageSize="countPerPage"
                     @onDoubleClick="onApplicationShopDoubleClick"
                     :current.sync="currentApplicationShopPage"
                     @onSearch="onApplicationShopSearch"
                     :data="applicationShopData" :columns="applicationShopColumns" :isLoading="isApplicationShopLoading"
                     :dataNum="applicationShopDataCount"></super_table>
      </Card>
    </div>
    <div class="bottom" v-bind:style="{ width: windowWidth*0.98 + 'px' }">
      <Card :bordered="false" v-bind:style="{ width: windowWidth*0.98 + 'px' }">
        <div slot="title">
          <Row justify="start" align="middle">
            <Col style="float:left"><p>基金APP信息</p></Col>
            <Col style="float:right;display: inline;">
              <Button type="primary" @click="apkDataReload">刷新</Button>
            </Col>
          </Row>
        </div>
        <super_table :pageSize="countPerPage" @onSearch="onApkSearch"
                     @onDoubleClick="onApkMessageDoubleClick"
                     :current.sync="currentApkPage" :data="apkData" :columns="apkDataColumns"
                     :isLoading="isApkLoading" :dataNum="apkDataCount"></super_table>
      </Card>
    </div>

  </div>

</template>


<script>
  import apkExpand from '../../components/table/apk-expand.vue'
  import super_table from '../../components/table/supertable.vue'
  import {createOrUpdateApplicationShop, deleteApplicationShop, getAllApplicationShop} from '../../api/applicationShop'
  import {createOrUpdateApkMessage, deleteApkMessage, getAllApkMessage} from '../../api/apkMessage'
  import {downloadByBlob, setQueryConditions} from '../../libs/util.js'

  export default {
    components: {
      apkExpand,
      super_table
    },
    data() {
      return {
        applicationShopSearchState: 0,
        applicationShopSearchData: {},
        apkSearchState: 0,
        apkSearchData: {},
        windowWidth: 0,
        isApplicationShopLoading: false,
        isApkLoading: false,
        applicationShopDataCount: 0,
        apkDataCount: 0,
        countPerPage: 5,
        applicationShopData: [],
        applicationShopColumns: [
          {
            type: 'index',
            align: 'center',
            width: '50',
            indexMethod: (row) => {
              return row._index + 1 + (this.currentApplicationShopPage - 1) * this.countPerPage
            }
          },
          {
            title: '创建者',
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
            key: 'shopName',
            filter: {
              type: 'Input'
            }
          },
          {
            title: '商店描述',
            key: 'shopDesc'
          },
          {
            title: '保存路径',
            key: 'path'
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
            title: '操作',
            key: 'action',
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
                      let temp = this.applicationShopData.find(function (item) {
                        return item.id === params.row.id
                      })
                      this.removeApplicationShop(temp.id)
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
        currentApplicationShopPage: 1,
        currentApkPage: 1,
        apkConditions: [],
        applicationShopConditions: [],
        currentApplicationShopData: {},
        currentApkMessageData: {},
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
      this.currentApplicationShopPage = 1
      this.currentApkPage = 1
      this.getApkMessageData({
        page: this.currentApkPage - 1,
        count: this.countPerPage
      })
      this.getApplicationShopData({
        page: this.currentApplicationShopPage - 1,
        count: this.countPerPage
      })
    },
    watch: {
      currentApplicationShopPage() {
        this.getApplicationShopData({
          page: this.currentApplicationShopPage - 1,
          count: this.countPerPage,
          conditions: this.applicationShopConditions
        })
      },
      currentApkPage() {
        if (this.hasClickUp) {
          this.isApkLoading = true
          let getHashClickUpDataCondition = this.hasClickUpConditions.concat(this.apkConditions)
          this.getHasClickUpData(getHashClickUpDataCondition)
        } else {
          this.getApkMessageData({
            page: this.currentApkPage - 1,
            count: this.countPerPage,
            conditions: this.apkConditions
          })
        }
      }
    },
    computed: {},
    methods: {
      getApplicationShopData({page, count, conditions = []}) {
        this.applicationShopSearchState = 0
        var that = this
        that.isApplicationShopLoading = true
        getAllApplicationShop({
          "page": page,
          "count": count,
          "conditions": conditions
        }).then(res => {
          const data = res.data.data.data
          that.applicationShopDataCount = res.data.data.size
          that.applicationShopData = data
          that.isApplicationShopLoading = false
        })
      },
      removeApplicationShop(id) {
        var that = this
        let dId = id
        this.$Modal.confirm({
          title: '警告',
          content: '该操作会导致应用商店数据永远从数据库移除，确定删除该应用商店吗？（非专业人员和维护人员请勿执行此操作）',
          onOk: function () {
            deleteApplicationShop(dId).then(res => {
              that.getApplicationShopData({
                page: that.currentApplicationShopPage - 1,
                count: that.countPerPage,
                conditions: that.applicationShopConditions
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
      onApplicationShopSearch(search) {
        this.applicationShopSearchData = search
        const keys = Object.keys(search);
        if (keys.length === 0) {
          this.applicationShopSearchState = 0
          this.getApplicationShopData({page: this.currentApplicationShopPage - 1, count: this.countPerPage})
          return
        }
        this.applicationShopConditions = []
        setQueryConditions(keys, search, this.applicationShopConditions)
        this.currentApplicationShopPage = 1
        this.getApplicationShopData({
          page: 0,
          count: this.countPerPage,
          conditions: this.applicationShopConditions
        })
        this.applicationShopSearchState = 1
      },
      onApkSearch(search) {
        this.apkSearchData = search
        const keys = Object.keys(search)
        if (keys.length === 0) {
          this.apkSearchState = 0
          let getApkMessageDataCondition = []
          if (this.hasClickUp) {
            getApkMessageDataCondition = this.hasClickUpConditions
          }
          this.getApkMessageData({
            page: this.currentApkPage - 1,
            count: this.countPerPage,
            conditions: getApkMessageDataCondition
          })
          return
        }
        this.currentApkPage = 1
        this.apkConditions = []
        setQueryConditions(keys, search, this.apkConditions)
        let getApkMessageDataCondition = this.apkConditions
        if (this.hasClickUp) {
          getApkMessageDataCondition = this.hasClickUpConditions.concat(this.apkConditions)
        }
        this.getApkMessageData({
          page: 0,
          count: this.countPerPage,
          conditions: getApkMessageDataCondition
        })
        this.apkSearchState = 1
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
        this.hasClickUp = false
        this.hasClickUpConditions = []
        this.currentApkPage = 1
        if (this.apkSearchState === 0) {
          this.getApkMessageData({
            page: 0,
            count: this.countPerPage
          })
        } else {
          this.onApkSearch(this.apkSearchData)
        }
      },
      applicationDataReload() {
        if (this.applicationShopSearchState === 0) {
          this.getApplicationShopData({
            page: this.currentApplicationShopPage - 1,
            count: this.countPerPage
          })
        } else {
          this.onApplicationShopSearch(this.applicationShopSearchData)
        }
      },
      onApplicationShopClick(currentRow) {
        if (currentRow.id === '' || currentRow.id === 0) {
          return
        }
        this.hasClickUp = true
        this.isApkLoading = true
        this.currentApkPage = 1
        this.apkSearchData = {}
        this.apkSearchState = false
        this.apkConditions = []
        this.hasClickUpConditions = [{
          "query": "app_shop_id",
          "queryString": currentRow.id
        }]
        this.getHasClickUpData(this.hasClickUpConditions)
      },
      getHasClickUpData(conditions) {
        getAllApkMessage({
          "page": this.currentApkPage - 1,
          "count": this.countPerPage,
          "conditions": conditions
        }).then(res => {
          this.apkDataCount = res.data.data.size
          this.apkData = res.data.data.data
          this.isApkLoading = false
        }).catch(() => {
          this.hasClickUp = false
          this.isApkLoading = false
          this.hasClickUpConditions = []
        })
      },
      onApplicationShopDoubleClick(currentRow) {
        var that = this
        this.currentApplicationShopData = currentRow
        this.$Modal.confirm({
          title: '修改应用商店信息',
          render: (h, params) => {
            return h('span', [
              h('p', '商店描述:'),
              h('Input', {
                props: {
                  placeholder: '输入商店描述',
                  value: currentRow.shopDesc,
                  size: "large",
                  clearable: true,
                  type: "textarea",
                  autosize: true
                },
                on: {
                  'on-change': (event) => {
                    this.currentApplicationShopData.shopDesc = event.target.value
                  }
                }
              }),
              h('p', '应用商店数据保存路径:'),
              h('Input', {
                props: {
                  placeholder: '输入应用商店数据保存路径',
                  value: currentRow.path,
                  size: "large",
                  clearable: true,
                  type: "textarea",
                  autosize: true
                },
                on: {
                  'on-change': (event) => {
                    this.currentApplicationShopData.path = event.target.value
                  }
                }
              }),
            ])
          },
          onOk: () => {
            that.editApplicationShopOK()
          }
        })
      },
      editApplicationShopOK() {
        createOrUpdateApplicationShop(this.currentApplicationShopData).then(res => {
          this.getApplicationShopData({page: this.currentApplicationShopPage - 1, count: this.countPerPage})
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
      },
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
