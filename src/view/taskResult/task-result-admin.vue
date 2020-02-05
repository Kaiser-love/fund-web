<template>
  <div class="container" ref="container">
    <div class="top" v-bind:style="{ width: windowWidth*0.98 + 'px' }">
      <Card :bordered="false" v-bind:style="{ width: windowWidth*0.98 + 'px' }">
        <div slot="title">
          <Row justify="start" align="middle">
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
          <Row justify="center" align="middle">
            <Col style="float:left"><p>APP质检结果列表</p></Col>
            <Col style="float:right;display: inline;">
              <Button type="primary" @click="taskResultDataReload" style="margin-left: 10px">刷新</Button>
            </Col>
          </Row>
        </div>
        <super_table :pageSize="countPerPage"
                     @onSearch="onTaskResultSearch"
                     :current.sync="currentTaskResultPage"
                     :data="taskResultData" :columns="taskResultColumns" :isLoading="isTaskResultLoading"
                     :dataNum="taskResultDataCount"></super_table>
      </Card>
    </div>
  </div>

</template>


<script>
  import apkExpand from '../../components/table/apk-expand.vue'
  import super_table from '@/components/table/supertable.vue'
  import {deleteTaskResult, getTaskResults} from '../../api/taskResult'
  import {createOrUpdateApkMessage, deleteApkMessage, getAllApkMessage} from '../../api/apkMessage'
  import {setQueryConditions, downloadByBlob} from '../../libs/util.js'

  export default {
    components: {
      apkExpand,
      super_table
    },
    data() {
      return {
        apkSearchState: 0,
        taskResultSearchState: 0,
        apkSearchData: {},
        taskResultSearchData: {},
        currentTaskResultData: {},
        currentApkMessageData: {},
        windowWidth: 0,
        isTaskResultLoading: false,
        isApkLoading: false,
        taskResultDataCount: 0,
        apkDataCount: 0,
        countPerPage: 5,
        taskResultData: [],
        taskResultColumns: [
          {
            type: 'index',
            width: 50,
            align: 'center',
            indexMethod: (row) => {
              return row._index + 1 + (this.currentTaskResultPage - 1) * this.countPerPage
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
            title: '违规类型',
            key: 'ruleTypeDesc',
            filter: {
              type: 'Input'
            }
          },
          {
            title: '违规标签',
            key: 'ruleLabel',
            filter: {
              type: 'Input'
            }
          },
          {
            title: '违规描述',
            key: 'taskResultDesc',
          },
          {
            title: '违规路径',
            key: 'violationRulePath'
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
                      let temp = this.taskResultData.find(function (item) {
                        return item.id === params.row.id
                      })
                      this.removeTaskResult(temp.id)
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
        currentTaskResultPage: 1,
        currentApkPage: 1,
        apkConditions: [],
        taskResultConditions: []
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
      this.currentTaskResultPage = 1
      this.currentApkPage = 1
      this.getApkMessageData({
        page: this.currentApkPage - 1,
        count: this.countPerPage
      })
      this.getTaskResultData({
        page: this.currentTaskResultPage - 1,
        count: this.countPerPage
      })
    },
    watch: {
      currentTaskResultPage() {
        this.getTaskResultData({
          page: this.currentTaskResultPage - 1,
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
      getTaskResultData({page, count, conditions = []}) {
        var that = this
        that.isTaskResultLoading = true
        getTaskResults({
          "page": page,
          "count": count,
          "conditions": conditions
        }).then(res => {
          const data = res.data.data.data
          that.taskResultDataCount = res.data.data.size
          that.taskResultData = data
          that.isTaskResultLoading = false
        })
      },
      removeTaskResult(id) {
        var that = this
        let dId = id
        this.$Modal.confirm({
          title: '警告',
          content: '该操作会导致该质检结果永远从数据库移除，确定删除该质检结果吗？（非专业人员和维护人员请勿执行此操作）',
          onOk: function () {
            deleteTaskResult(dId).then(res => {
              this.$message.success("删除成功")
              that.getTaskResultData({
                page: that.currentTaskResultPage - 1,
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
      onTaskResultSearch(search) {
        this.taskResultSearchData = search
        const keys = Object.keys(search)
        if (keys.length === 0) {
          this.taskResultSearchData = 0
          this.getTaskResultData({page: this.currentTaskResultPage - 1, count: this.countPerPage})
          return
        }
        this.currentTaskResultPage = 1
        this.taskResultConditions = []
        setQueryConditions(keys, search, this.taskResultConditions)
        this.getTaskResultData({
          page: 0,
          count: this.countPerPage,
          conditions: this.taskResultConditions
        })
        this.taskResultSearchState = 1
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
            page: this.currentTaskResultPage - 1,
            count: this.countPerPage
          })
        } else {
          this.onApkSearch(this.apkSearchData)
        }
      },
      taskResultDataReload() {
        if (this.taskResultSearchState === 0) {
          this.getTaskResultData({
            page: this.currentTaskResultPage - 1,
            count: this.countPerPage
          })
        } else {
          this.onTaskResultSearch(this.taskResultSearchData)
        }
      },
      onAppMessageClick(currentRow) {
        const that = this;
        that.isTaskResultLoading = true
        if (currentRow.id === '' || currentRow.id === 0) {
          that.taskResultData = []
          that.isTaskResultLoading = false
          return
        }
        this.currentTaskResultPage = 1
        getTaskResults({
          "page": 0,
          "count": this.countPerPage,
          "conditions": [{
            "query": "app_id",
            "queryString": currentRow.id
          }, {
            "query": "app_shop_id",
            "queryString": currentRow.appShopId
          }]
        }).then(res => {
          that.taskResultDataCount = res.data.data.size
          that.taskResultData = res.data.data.data
          that.isTaskResultLoading = false
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
