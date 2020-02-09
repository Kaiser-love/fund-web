<template>
  <div class="container" ref="container">
    <el-row type="flex">
      <el-col :span="3">
        <div>
          <input type="text" placeholder="请输入基金APP名" class="el-input__inner" v-model="searchValue"
                 @keypress="dropDownSearch">
          <el-scrollbar style="margin-top: 13px">
            <el-menu background-color="#F5F7F9" @select="handleSelectApk"
                     @open="handleSelectApplication" unique-opened class="project-dropdown">
              <el-submenu index="-1">
                <template slot="title"><i class="el-icon-monitor"></i>全部基金APP</template>
                <el-submenu v-for="applicationShop in applicationShopData" :index="applicationShop.id+''"
                            :disabled="disabled">
                  <template slot="title"><i :class="applicationShop.menuIconClass"></i>{{applicationShop.shopName}}
                  </template>
                  <el-menu-item :index="apkMessage.id+''"
                                v-for="apkMessage in apkOpenDisplayData">
                    {{apkMessage.apkName}}
                  </el-menu-item>
                </el-submenu>
              </el-submenu>
            </el-menu>
          </el-scrollbar>
        </div>
      </el-col>
      <el-col :span="21">
        <el-row type="flex" class="row-bg">
          <el-col :span="24" type="flex">
            <el-row class="row-bg">
              <div style="margin-top: 0;">
                <Card>
                  <el-row>
                    <el-col :span="14">
                      <el-col style="float:left;margin-left: 20px;margin-bottom: 10px"><p
                        style="font-size: 20px;font-weight: bold">{{displayAppName}}</p>
                      </el-col>
                      <Col style="margin-top: 8px;margin-left: 20px">
                        <span style="font-size: 15px;">综合违规得分</span>
                        <el-tooltip class="item" effect="dark" content="违规得分提示待补充" placement="right-end">
                          <i class="el-icon-warning"></i>
                        </el-tooltip>
                      </Col>
                      <el-col style="float:left;height: 60px;margin-left: 20px;">
                        <Row>
                        <span
                          style="font-size: 50px;">95</span>
                          <span style="font-size: 30px;margin-left: 3px">分</span>
                          <el-col id="main" style="height: 300px;">
                          </el-col>
                        </Row>
                      </el-col>
                    </el-col>
                    <el-col :span="10" type="flex">
                      <p style="font-size: 20px;font-weight: bold;margin-left: 3px;margin-bottom: 10px">得分排名</p>
                      <super_table :pageSize="countPerPage" :current.sync="currentPage" :data="logData"
                                   :columns="tableColumns"
                                   :isLoading="isTableLoading" :dataNum="logDataCount"></super_table>
                    </el-col>
                  </el-row>
                </Card>
              </div>
            </el-row>
            <el-row class="row-bg">
              <el-col>
                <Card>
                  <p style="font-size: 20px;font-weight: bold;margin-left: 3px;margin-bottom: 10px">质检结果</p>
                  <super_table :pageSize="taskResultCountPerPage" :current.sync="currentTaskResultPage"
                               :data="taskResultData"
                               :columns="taskResultColumns" @onSearch="onTaskResultSearch"
                               :isLoading="isTaskResultLoading" :dataNum="taskResultDataCount"></super_table>
                </Card>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
        <el-col :span="24">
          <div style="margin-top: 3px">
            <Card>
              <div style="float:right">
                <DatePicker type="daterange" size="large"
                            v-model="dateValue"
                            :options="pickerOptions"
                            placement="bottom-end"
                            placeholder="选择时间范围"
                            style="width: 300px">
                </DatePicker>
              </div>
              <ve-line :data="chartData" height="400px" legend-position="bottom"
                       :title="chartTitle"></ve-line>
            </Card>
          </div>
        </el-col>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import axios from '@/libs/api.request'
  import InforCard from '_c/info-card'
  import CountTo from '_c/count-to'
  import {ChartPie} from '_c/charts'
  import super_table from '../../components/table/supertable.vue'
  import {getAllLog} from '../../api/log'
  import "echarts/lib/component/title";
  import echarts from 'echarts'
  import {getAllApplicationShop} from "../../api/applicationShop";
  import {getAllApkMessage} from "../../api/apkMessage";
  import {createOrUpdateTaskResult, getTaskResults} from "../../api/taskResult";
  import {setQueryConditions} from "../../libs/util";

  export default {
    name: 'home',
    components: {
      super_table,
      InforCard,
      CountTo,
      ChartPie,
    },
    data() {
      return {
        scorerRows: [97, 68, 100, 67, 88],
        isTableLoading: false,
        countPerPage: 12,
        currentPage: 1,
        logDataCount: 0,
        logData: [],
        chartTitle: {text: '违规得分趋势', left: 'left'},
        cycleJobChartData: {
          columns: ['name', '数量'],
          rows: [
            {'name': 'APP爬取', '数量': 4593},
            {'name': 'APP截图', '数量': 4593},
            {'name': '违规检测', '数量': 4593},
          ]
        },
        chartData: {
          columns: ['name', '数量'],
          rows: [
            {'name': '应用商店', '数量': 1393},
            {'name': '基金APP', '数量': 3530},
            {'name': '定时任务', '数量': 2923},
            {'name': '用户', '数量': 1723},
            {'name': 'APP路径', '数量': 3792},
            {'name': '日志', '数量': 4593},
            {'name': '违规项', '数量': 4593},
            {'name': '质检规则', '数量': 4593},
            {'name': '质检结果', '数量': 4593},
          ]
        },
        tableColumns: [
          {
            type: 'index',
            width: 60,
            align: 'center',
            indexMethod: (row) => {
              return row._index + 1 + (this.currentPage - 1) * this.countPerPage
            }
          },
          {
            title: '用户名',
            key: 'userName'
          },
          {
            title: '操作',
            key: 'logDescription'
          },
          {
            title: 'IP',
            key: 'ip'
          },
          {
            title: '是否成功',
            key: 'succeed'
          },
          {
            title: '执行时间',
            key: 'createTime',
            render: (h, params) => {
              return h('div', new Date(parseInt(params.row.createTime)).toLocaleString())
            }
          }
        ],
        isShow: false,
        inforCardData: [
          {title: '应用商店数量', icon: 'md-person-add', count: 803, color: '#2d8cf0'},
          {title: '基金APP数量', icon: 'md-locate', count: 232, color: '#19be6b'},
          {title: '定时任务数量', icon: 'md-help-circle', count: 142, color: '#ff9900'},
          {title: '用户数量', icon: 'md-share', count: 657, color: '#ed3f14'},
          {title: 'APP路径数量', icon: 'md-chatbubbles', count: 12, color: '#E46CBB'},
          {title: '日志数量', icon: 'md-map', count: 14, color: '#9A66E4'},
          {title: '违规项数量', icon: 'ios-clipboard-outline', count: 14, color: '#ED55E4'},
          {title: '质检规则数量', icon: 'ios-cog', count: 14, color: '#E61A1A'},
          {title: '质检结果数量', icon: 'logo-buffer', count: 14, color: '#3A66F4'},
        ],
        applicationShopData: [],
        applicationShopToApkMapData: {},
        apkOpenData: [],
        apkOpenDisplayData: [],
        disabled: false,
        currentTaskResultPage: 1,
        taskResultConditions: [],
        taskResultData: [],
        taskResultDataCount: 0,
        taskResultSearchState: 0,
        isTaskResultLoading: false,
        stateDisable: false,
        hasClickUp: false,
        hasClickUpConditions: [],
        taskResultSearchData: {},
        taskResultCountPerPage: 7,
        displayAppName: '全部基金APP',
        appShopIdToNameMap: {},
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
            key: "createUserName",
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
            title: '违规类型',
            key: 'ruleTypeDesc',
            filter: {
              type: 'Input'
            }
          },
          {
            title: '违规标签',
            key: 'label',
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
            title: '是否误检',
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
                    createOrUpdateTaskResult(params.row).then(res => {
                      params.row.state = res.data.data.state
                      this.$Message.success("修改成功")
                    }).finally(() => this.stateDisable = false)
                  }
                }
              }, [
                h('span', {
                  slot: 'open'
                }, '正常'),
                h('span', {
                  slot: 'close'
                }, '误检')
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
        searchValue: '',
        // 时间选择器
        dateValue: '',
        pickerOptions: {
          shortcuts: [
            {
              text: '最近一周',
              value() {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                return [start, end];
              }
            },
            {
              text: '最近一个月',
              value() {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                return [start, end];
              }
            },
            {
              text: '最近3个月',
              value() {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                return [start, end];
              }
            }
          ]
        }
      };
    },
    mounted() {
      this.$nextTick(function () {
        this.drawPie('main')
      })
    }
    ,
    created() {
      this.dateValue = this.pickerOptions['shortcuts'][0].value.apply()
      getAllApplicationShop({}).then(res => {
        this.applicationShopData = res.data.data.data
        this.applicationShopData.forEach(applicationShop => {
          this.applicationShopToApkMapData[applicationShop.id] = []
          this.appShopIdToNameMap[applicationShop.id] = applicationShop.shopName
        })
      })
      this.getTaskResultData({page: 0, count: this.taskResultCountPerPage})
      this.getLogTableData({page: 0, count: this.countPerPage})
      axios.request({
        url: '/fundApi/v1/common/index',
        methods: 'get'
      }).then(res => {
        this.inforCardData[0].count = res.data.data.applicationShopSize
        this.inforCardData[1].count = res.data.data.apkSize
        this.inforCardData[2].count = res.data.data.cycleJobSize
        this.inforCardData[3].count = res.data.data.userSize
        this.inforCardData[4].count = res.data.data.appPathSize
        this.inforCardData[5].count = res.data.data.logSize
        this.inforCardData[6].count = res.data.data.violationItemSize
        this.inforCardData[7].count = res.data.data.violationRuleSize
        this.inforCardData[8].count = res.data.data.taskResultSize

        this.chartData.rows[0]['数量'] = res.data.data.applicationShopSize
        this.chartData.rows[1]['数量'] = res.data.data.apkSize
        this.chartData.rows[2]['数量'] = res.data.data.cycleJobSize
        this.chartData.rows[3]['数量'] = res.data.data.userSize
        this.chartData.rows[4]['数量'] = res.data.data.appPathSize
        this.chartData.rows[5]['数量'] = res.data.data.logSize
        this.chartData.rows[6]['数量'] = res.data.data.violationItemSize
        this.chartData.rows[7]['数量'] = res.data.data.violationRuleSize
        this.chartData.rows[8]['数量'] = res.data.data.taskResultSize

        this.isShow = true
      })
    }
    ,
    watch: {
      currentPage() {
        this.getLogTableData({page: this.currentPage - 1, count: this.countPerPage})
      }
      ,
      currentTaskResultPage() {
        if (this.hasClickUp) {
          this.isTaskResultLoading = true
          let getHashClickUpDataCondition = this.hasClickUpConditions.concat(this.taskResultConditions)
          this.getHasClickUpData(getHashClickUpDataCondition)
        } else {
          this.getTaskResultData({
            page: this.currentTaskResultPage - 1,
            count: this.taskResultCountPerPage
          })
        }
      }
    }
    ,
    methods: {
      async getApkDataByApplicationId(appShopId) {
        if (this.applicationShopToApkMapData[appShopId].length === 0) {
          await getAllApkMessage({
            conditions: [{
              "query": "app_shop_id",
              "queryString": appShopId
            }]
          }).then(res => {
            this.applicationShopToApkMapData[appShopId] = res.data.data.data
            this.apkOpenData = this.applicationShopToApkMapData[appShopId]
            this.apkOpenDisplayData = this.apkOpenData
            this.disabled = false
          }).catch(() => {
            this.disabled = false
          })
        } else {
          this.apkOpenData = this.applicationShopToApkMapData[appShopId]
          this.apkOpenDisplayData = this.apkOpenData
          this.disabled = false
        }
      }
      ,
      handleSelectApplication(index) {
        if (index === '-1') {
          this.currentTaskResultPage = 1
          this.getTaskResultData({page: this.currentTaskResultPage - 1, count: this.countPerPage})
          return
        }
        this.displayAppName = this.appShopIdToNameMap[index]
        this.apkOpenData = []
        this.disabled = true
        this.getApkDataByApplicationId(index)
      }
      ,
      handleSelectApk(index) {
        this.hasClickUp = true
        this.hasClickUpConditions = [{
          "query": "app_id",
          "queryString": index
        }]
        this.isTaskResultLoading = true
        this.currentTaskResultPage = 1
        this.getHasClickUpData(this.hasClickUpConditions)
      }
      ,
      drawPie(elementId) {
        let charts = echarts.init(document.getElementById(elementId))
        let option = {
          title: {
            // text: "违规得分",
            link: 'https://www.baidu.com',
            target: "blank",
            left: 'left',
          },
          tooltip: {
            formatter: function (params) {
              return '';
            }
          },
          legend: {
            orient: 'vertical',
            x: 'left',      //可设定图例在左、右、居中
            y: 'center',     //可设定图例在上、下、居中
            padding: [0, 50, 0, 30],   //可设定图例[距上方距离，距右方距离，距下方距离，距左方距离]
            data: ['天天基金']
          },
          radar: {
            // shape: 'circle',
            // 图表的位置
            grid: {
              position: 'left',
            },
            radius: 90,//半径，可放大放小雷达图
            splitNumber: 4,
            splitLine: {
              show: true,
              lineStyle: {
                width: 1,
                color: 'grey' // 图表背景网格线的颜色
              }
            },
            splitArea: {
              show: false,
            },
            indicator: [
              {name: '非法承诺收益', max: 100},
              {name: '承诺保本保收益', max: 100},
              {name: '夸大收益', max: 100},
              {name: '缺少合理风险提示', max: 100},
              {name: '诋毁其他基金管理人', max: 100}
            ]
          },
          series: [{
            name: '天天基金',
            type: 'radar',
            // areaStyle: {normal: {}},
            data: [
              {
                value: this.scorerRows,
                name: '天天基金'
              }
            ]
          }]
        };
        charts.setOption(option);
        let i = 0;
        charts.setOption({
          radar: [
            {
              name: {
                textStyle: {
                  color: '#666',
                  backgroundColor: '#fff',
                  borderRadius: 3,
                  padding: [3, 5]
                },
                rich: {
                  a: {
                    color: 'grey',
                    lineHeight: 20
                  },
                  b: {
                    color: '#000',
                    align: 'center',
                    backgroundColor: '#fff',
                    padding: 2,
                    borderRadius: 4
                  }
                },
                formatter: (a, b) => {
                  return `${a}\n{b|${this.scorerRows[i++]}}`
                }
              },
            }
          ]
        })
        window.addEventListener("resize", () => {
          charts.resize();
        });
      }
      ,
      getLogTableData({page, count}) {
        this.isTableLoading = true
        getAllLog({page: page, count: count}).then(res => {
          this.logDataCount = res.data.data.size
          this.logData = res.data.data.data
          this.isTableLoading = false
        })
      }
      ,
      getTaskResultData({page, count, conditions}) {
        this.isTaskResultLoading = true
        getTaskResults({page: page, count: count, conditions: conditions}).then(res => {
          this.taskResultDataCount = res.data.data.size
          this.taskResultData = res.data.data.data
          this.isTaskResultLoading = false
        })
      }
      ,
      onTaskResultSearch(search) {
        this.taskResultSearchData = search
        const keys = Object.keys(search)
        this.isTaskResultLoading = true
        if (keys.length === 0) {
          this.taskResultSearchState = 0
          let getApkMessageDataCondition = []
          if (this.hasClickUp) {
            getApkMessageDataCondition = this.hasClickUpConditions
          }
          this.getHasClickUpData(getApkMessageDataCondition)
          return
        }
        this.currentTaskResultPage = 1
        this.taskResultConditions = []
        setQueryConditions(keys, search, this.taskResultConditions)
        let getApkMessageDataCondition = this.taskResultConditions
        if (this.hasClickUp) {
          getApkMessageDataCondition = this.hasClickUpConditions.concat(this.taskResultConditions)
        }
        this.getHasClickUpData(getApkMessageDataCondition)
        this.taskResultSearchState = 1
      }
      ,
      getHasClickUpData(conditions) {
        getTaskResults({
          "page": this.currentTaskResultPage - 1,
          "count": this.taskResultCountPerPage,
          "conditions": conditions
        }).then(res => {
          this.taskResultDataCount = res.data.data.size
          this.taskResultData = res.data.data.data
          this.isTaskResultLoading = false
        }).catch(() => {
          this.isTaskResultLoading = false
          this.hasClickUp = false
          this.hasClickUpConditions = []
        })
      }
      ,
      dropDownSearch() {
        if (this.apkOpenData.length === 0) {
          return
        }
        if (this.searchValue === '') {
          this.apkOpenDisplayData = this.apkOpenData
        }
        this.apkOpenDisplayData = this.apkOpenData.filter(key => key.apkName.indexOf(this.searchValue) !== -1)
      }
    }

  }
</script>

<style lang="less">
  .count-style {
    font-size: 50px;
  }

  .project-dropdown {
    // 设置高度才能显示出滚动条 !important
    height: 1250px;
    white-space: nowrap;
    overflow: auto;
  }

  &::-webkit-scrollbar {
    display: none;
  }

</style>
