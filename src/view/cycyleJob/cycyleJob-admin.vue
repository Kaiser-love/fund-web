<template>
  <div ref="container"
       style="display: flex;flex-direction: column;flex-wrap: wrap;justify-content: flex-start; align-items: center;align-content: center;">
    <Card :bordered="false" v-bind:style="{ width: windowWidth*0.98 + 'px' }">
      <div slot="title">
        <Row justify="center" align="middle">
          <Col style="float:left"><p>定时任务信息</p></Col>
          <Col style="float:right;display: inline;">
            <Button type="primary" @click="cycleJobReload">刷新</Button>
          </Col>
        </Row>
      </div>
      <super_table @onDoubleClick="onTableClick" :pageSize="countPerPage" :current.sync="currentPage"
                   @onSearch="onTableSearch" :data="cycleJobData" :columns="tableColumns" :isLoading="isTableLoading"
                   :dataNum="cycleJobDataCount"></super_table>
    </Card>
    <Card :bordered="false" v-bind:style="{ marginTop:'30px', width: windowWidth*0.98 + 'px' }">
      <div slot="title">
        <Row type="flex" justify="center" align="middle">
          <Col span="24"><p>添加定时任务</p></Col>
        </Row>
      </div>
      <Row justify="center" align="middle">
        <Col style="float:left">
          <span>应用商店定时任务：</span>
          <Select style="margin-left:8px;width: 200px" v-model="taskTypeMode">
            <Option v-for="(item) in taskTypes" :key="item.code" :value="item.code">{{item.desc}}</Option>
          </Select>
        </Col>
        <Col style="float:left;margin-left: 50px">
          <span style="margin-left:8px;">选择应用商店：</span>
          <Select v-model="shopId" style="width: 200px" :transfer="true">
            <Option v-for="(item) in applicationShopData" :key="item.id" :value="item.id">{{item.shopName}}</Option>
          </Select>
        </Col>
        <Col style="float:left;margin-left: 50px">
          <span style="margin-left:8px;">cron表达式：</span>
          <div style="display: inline-block;">
            <Input v-model="taskCronExpr" placeholder="输入cron表达式" style="margin-left:8px;width: 200px">
            </Input>
            <Button slot="append" type="primary" @click="isTaskCronModalShow=true">选择时间</Button>
          </div>
        </Col>
        <Col style="float:right">
          <Button style="float:right" type="primary" @click="onAddCycleJob">添加</Button>
        </Col>
      </Row>
    </Card>
    <corn-selector ref="cornSel" :isModalShow="isCronModalShow" @onOk="onCron" @onIsShow="onIsShow"></corn-selector>
    <corn-selector ref="cornGoodSel" :isModalShow="isTaskCronModalShow" @onOk="onTaskCron"
                   @onIsShow="onIsTaskShow"></corn-selector>

  </div>
</template>
<script>
  import {
    createOrUpdateCycleJob,
    deleteCycleJob,
    getCycleJobs,
  } from '../../api/task'
  import {
    getAllApplicationShop,
  } from '../../api/applicationShop'
  import super_table from '../../components/table/supertable.vue'
  import cronSelector from '@/components/corn-selector/corn-selector.vue'
  import {getTaskTypes} from '../../api/metaApi'
  import {setQueryConditions} from '../../libs/util.js'

  export default {
    components: {
      super_table,
      'corn-selector': cronSelector
    },
    data() {
      return {
        windowWidth: 0,
        isUpDisable: false,
        stateDisable: false,
        isTableLoading: false,
        countPerPage: 6,
        currentPage: 1,
        cycleJobDataCount: 0,
        cycleJobData: [],
        tableColumns: [
          {
            title: '应用商店',
            key: 'marketName',
            filter: {
              type: 'Input'
            }
          },
          {
            title: '任务类型',
            key: 'taskTypeDesc',
            filter: {
              type: 'Input'
            }
          },
          {
            title: '任务描述',
            key: 'taskDesc'
          },
          {
            title: 'cron表达式',
            key: 'cron',
            render: (h, params) => {
              let cron = ''
              if (params.row.mode === 0 || params.row.mode === 1 || params.row.mode === 2) {
                cron = params.row.args.split('、')[0]
              } else {
                cron = params.row.cron
              }
              return h('div', cron)
            }
          },
          {
            title: '运行实例',
            key: 'instance',
          },
          {
            title: '创建时间',
            key: 'createTime',
          },
          {
            title: '最近修改时间',
            key: 'updateTime',
          },
          {
            title: '运行状态',
            key: 'isUp',
            filter: {
              type: 'Input'
            },
            width: '120',
            render: (h, params) => {
              return h('i-switch', {
                props: {
                  value: params.row.isUp === 1,
                  size: 'large',
                  disabled: this.isUpDisable || params.row.state !== 1
                },
                on: {
                  'on-change': (val) => {
                    this.isUpDisable = true
                    if (val) {
                      params.row.isUp = 1
                    } else {
                      params.row.isUp = 0
                    }
                    createOrUpdateCycleJob(params.row).then(res => {
                      params.row.isUp = res.data.data.isUp
                      this.$Message.success("修改成功")
                    }).finally(this.isUpDisable = false)
                  }
                }
              }, [
                h('span', {
                  slot: 'open'
                }, '运行'),
                h('span', {
                  slot: 'close'
                }, '停止')
              ])
            }
          },
          {
            title: '状态',
            key: 'state',
            filter: {
              type: 'Input'
            },
            width: '120',
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
                    createOrUpdateCycleJob(params.row).then(res => {
                      params.row.state = res.data.data.state
                      params.row.isUp = res.data.data.isUp
                      this.$Message.success("修改成功")
                    }).finally(this.stateDisable = false)
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
            align: 'center',
            width: '100',
            render: (h, params) => {
              return h('div', [
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
                      this.remove(params.row.id)
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],
        currentCycleJobData: {},
        isCronModalShow: false,
        taskCronExpr: '',
        isTaskCronModalShow: false,
        shopId: -1,
        taskTypeMode: -1,
        cycleJobSearchState: 0,
        cycleJobSearchData: {},
        cycleJobSearchCondition: [],
        applicationShopData: [],
        taskTypes: []
      }
    },
    created() {
      this.getCycleJobTableData({page: 0, count: this.countPerPage})
      getAllApplicationShop({page: 0, count: 100}).then(res => {
        this.applicationShopData = res.data.data.data
      })
      getTaskTypes().then(res => {
        this.taskTypes = res.data.data
      })
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
    watch: {
      currentPage() {
        this.getCycleJobTableData({page: this.currentPage - 1, count: this.countPerPage})
      }
    },
    computed: {},
    methods: {
      onAddCycleJob() {
        if (this.taskTypeMode === -1 || this.shopId === -1 || this.taskCronExpr === '') {
          this.$Message.error('请配置定时任务后在点击哦')
          return;
        }
        createOrUpdateCycleJob({
          "id": 0,
          "taskType": this.taskTypeMode,
          "appShopId": this.shopId,
          "cron": this.taskCronExpr
        }).then(res => {
          this.cycleJobReload()
          this.$Message.success('新增定时任务成功')
        })
      },
      getCycleJobTableData({page, count, conditions = []}) {
        var that = this
        that.isTableLoading = true
        getCycleJobs({page: page, count: count, conditions: conditions}).then(res => {
          that.cycleJobData = res.data.data.data
          that.cycleJobDataCount = res.data.data.size
          that.isTableLoading = false
        })
      },
      remove(id) {
        var that = this
        this.$Modal.confirm({
          title: '警告',
          content: '确定删除该定期任务吗？',
          onOk: function () {
            deleteCycleJob(id)
              .then(() => {
                that.$Message.success("删除成功")
                that.getCycleJobTableData({page: that.currentPage - 1, count: that.countPerPage})
              })
          }
        })
      },
      onTableSearch(search) {
        this.cycleJobSearchData = search
        var keys = Object.keys(search)
        if (keys.length === 0) {
          this.applicationShopSearchState = 0
          this.getCycleJobTableData({page: 0, count: this.countPerPage})
          return
        }
        this.cycleJobSearchCondition = []
        setQueryConditions(keys, search, this.cycleJobSearchCondition)
        this.currentPage = 1
        this.getCycleJobTableData({page: 0, count: this.countPerPage, conditions: this.cycleJobSearchCondition})
        this.applicationShopSearchState = 1
      },
      cycleJobReload() {
        if (this.applicationShopSearchState === 0) {
          this.getCycleJobTableData({
            page: this.currentApplicationShopPage - 1,
            count: this.countPerPage
          })
        } else {
          this.onTableSearch(this.cycleJobSearchData)
        }
      },
      onTableClick(currentRow) {
        var that = this
        this.currentCycleJobData = currentRow
        this.$Modal.confirm({
          title: '设置定期任务',
          render: (h, params) => {
            return h('span', [
              h('p', '应用商店:'),
              h('Select', {
                  props: {
                    value: this.currentCycleJobData.appShopId
                  },
                  on: {
                    'on-change': (val) => {
                      this.currentCycleJobData.appShopId = val
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
              h('p', '任务类型:'),
              h('Select', {
                  props: {
                    value: this.currentCycleJobData.taskType
                  },
                  on: {
                    'on-change': (val) => {
                      this.currentCycleJobData.taskType = val
                    }
                  }
                },
                that.taskTypes.map((item) => {
                  return h('Option', {
                    props: {
                      value: item.code,
                      label: item.desc
                    }
                  })
                })
              ),
              h('p', '任务描述:'),
              h('Input', {
                props: {
                  placeholder: '输入任务描述',
                  value: currentRow.taskDesc
                },
                on: {
                  'on-change': (event) => {
                    this.currentCycleJobData.taskDesc = event.target.value
                  }
                }
              }),
              h('p', 'cron表达式:'),
              h('Input', {
                attrs: {
                  style: 'width: 360px'
                },
                props: {
                  value: this.currentCycleJobData.cron
                }
              }, [
                h('Button', {
                  slot: 'append',
                  on: {
                    'click': () => {
                      that.$refs.cornSel.init(this.currentCycleJobData.cron)
                      that.isCronModalShow = true
                    }
                  }
                }, '选择时间')
              ])
            ])
          },
          onOk: () => {
            that.editOK()
          }
        })
      },
      editOK() {
        createOrUpdateCycleJob(this.currentCycleJobData).then(res => {
          this.getCycleJobTableData({page: this.currentPage - 1, count: this.countPerPage})
          this.$Message.success("修改成功")
        })
      },
      onCron(data) {
        this.currentCycleJobData.cron = data
      },
      onTaskCron(data) {
        this.taskCronExpr = data
      },
      onIsShow(val) {
        this.isCronModalShow = val
      },
      onIsTaskShow(val) {
        this.isTaskCronModalShow = val
      }
    }
  }
</script>
<style scoped>
  .Row {
    margin-bottom: 6px;
  }
</style>
