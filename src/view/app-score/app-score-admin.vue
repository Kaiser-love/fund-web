<template>
  <div class="container" ref="container">
    <el-row type="flex">
      <el-col :span="3">
        <input type="text" placeholder="请输入基金APP名" class="el-input__inner" v-model="searchValue"
               @keypress="dropDownSearch">
        <el-scrollbar style="margin-top: 13px">
          <el-menu background-color="#F5F7F9" @select="handleSelectApk" element-loading-text="拼命加载中"
                   element-loading-spinner="el-icon-loading"
                   element-loading-background="rgba(0, 0, 0, 0.8)"
                   v-loading="fullscreenLoading"
                   @close="handleCloseApplication"
                   @open="handleSelectApplication"
                   unique-opened class="project-dropdown">
            <el-submenu index="-1">
              <template slot="title"><i class="el-icon-monitor"></i>全部基金APP</template>
              <el-submenu index="-2">
                <template slot="title"><i class="el-icon-monitor"></i>全部应用商店</template>
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
            </el-submenu>
          </el-menu>
        </el-scrollbar>
      </el-col>
      <el-col :span="21">
        <el-row type="flex" class="row-bg">
          <el-col :span="24" type="flex">
            <el-row class="row-bg">
              <Card>
                <el-row>
                  <DatePicker type="daterange" size="large" transfer @on-change="flushDate"
                              v-model="dateValue"
                              :options="pickerOptions"
                              placeholder="选择时间范围" style="width: 300px;float:right;">
                  </DatePicker>
                  <el-col :span="2">
                    <el-col style="float:left;margin-left: 20px;margin-bottom: 10px;"><p
                      style="font-size: 18px;font-weight: bold;">{{displayAppName}}</p>
                    </el-col>
                    <Col style="margin-top: 8px;margin-left: 20px">
                      <span style="font-size: 12px;">综合违规得分</span>
                      <el-tooltip class="item" effect="dark" content="违规得分提示待补充" placement="right-end"
                                  style="display: inline-block">
                        <i class="el-icon-warning"></i>
                      </el-tooltip>
                    </Col>
                    <el-col style="float:left;height: 60px;margin-left: 20px;">
                      <Row>
                        <span
                          style="font-size: 50px;">{{averageScore}}</span>
                        <span style="font-size: 30px;margin-left: 3px;">分</span>
                      </Row>
                    </el-col>
                  </el-col>
                  <el-col :span="8" type="flex">
                    <el-button type="info" icon="el-icon-s-tools" circle v-loading.fullscreen.lock="fullscreenLoading"
                               style="float:right;margin-right:30px;margin-top:30px"
                               @click="settingScoreConfig"></el-button>
                    <el-col id="main" style="height: 300px;width: 400px;margin-top: 92px;">
                    </el-col>
                  </el-col>
                  <el-col :span="14" type="flex">
                    <ve-line :data="chartData" height="400px" legend-position="bottom"
                             :title="chartTitle"></ve-line>
                  </el-col>
                </el-row>
              </Card>
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
      </el-col>
    </el-row>
    <Modal :width="1000" v-model="addModal" title="修改配置" :loading="true" @on-ok="asyncAddOK">
      <div>
        <!--        <el-button type="warning" icon="el-icon-star-off" circle @click="addTab(editableTabsValue)"-->
        <!--                   style="float: right;margin-bottom: 30px"></el-button>-->
        <el-tabs v-model="editableTabsValue" :tab-position="tabPosition">
          <el-tab-pane
            v-for="(item, index) in violateRuleConfigs"
            :key="item.id"
            :label="item.violationName"
            :name="item.id+''">
            <Row type="flex" class="Row">
              <Col span="23">
                <Col>
                  <p style="font-size: 20px;font-weight: bold">维度名设置</p>
                  <el-input placeholder="请输入维度名" v-model="item.violationName" clearable></el-input>
                </Col>
                <Col>
                  <p style="font-size: 20px;font-weight: bold;margin-top: 20px">已选违规项</p>
                  <Select v-model="item.violationItemIds" :value="item.violationItemIds" multiple>
                    <Option v-for="violateItem in item.violationItems" :value="violateItem.code"
                            :key="violateItem.code">{{ violateItem.desc }}
                    </Option>
                  </Select>
                </Col>
                <Col>
                  <p style="font-size: 20px;font-weight: bold;margin-top: 20px">维度权重设置</p>
                  <el-input placeholder="请输入权重" v-model="item.violationWeight" clearable></el-input>
                </Col>
                <Col>
                  <p style="font-size: 20px;font-weight: bold;margin-top: 20px">{{item.title}}分数区间设置</p>
                  <el-table
                    :data="item.violateRuleScores"
                    style="width: 100%" @cell-dblclick="cellDoubleClick">
                    <el-table-column
                      prop="lowerLimit"
                      label="下限"
                      width="180">
                      <template slot-scope="scope">
                        <el-input placeholder="请输入下限" v-show="scoreEditShow" v-model="scope.row.lowerLimit"></el-input>
                        <span v-show="!scoreEditShow">{{scope.row.lowerLimit}}</span>
                      </template>
                    </el-table-column>
                    <el-table-column
                      label="上限"
                      width="180">
                      <template slot-scope="scope">
                        <el-input placeholder="请输入上限" v-show="scoreEditShow" v-model="scope.row.upperLimit"></el-input>
                        <span v-show="!scoreEditShow">{{scope.row.upperLimit}}</span>
                      </template>
                    </el-table-column>
                    <el-table-column
                      label="分数">
                      <template slot-scope="scope">
                        <el-input placeholder="请输入分数" v-show="scoreEditShow" v-model="scope.row.score"></el-input>
                        <span v-show="!scoreEditShow">{{scope.row.score}}</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </Col>
              </Col>
            </Row>
          </el-tab-pane>
        </el-tabs>
      </div>
    </Modal>

  </div>
</template>

<script>
  import InforCard from '_c/info-card'
  import CountTo from '_c/count-to'
  import {ChartPie} from '_c/charts'
  import super_table from '../../components/table/supertable.vue'
  import "echarts/lib/component/title";
  import echarts from 'echarts'
  import {getAllApplicationShop} from "../../api/applicationShop";
  import {getAllApkMessage} from "../../api/apkMessage";
  import {createOrUpdateTaskResult, getTaskResults} from "../../api/taskResult";
  import {setQueryConditions} from "../../libs/util";
  import {getAllViolateRuleConfigs, createOrUpdateViolateRuleConfigs} from "../../api/violateRuleConfig";
  import {
    calculateViolateScore,
    calculateViolateScoreTendency,
  } from "../../api/violateScore";

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
        fullscreenLoading: false,
        scoreEditShow: false,
        editableTabsValue: '',
        violateRuleConfigs: [],
        tabIndex: 2,
        tabPosition: 'left',
        addModal: false,
        scoreRows: [97, 68, 100, 67, 88],
        scoreColumns: [
          {name: '非法承诺收益', max: 100},
          {name: '承诺保本保收益', max: 100},
          {name: '夸大收益', max: 100},
          {name: '缺少合理风险提示', max: 100},
          {name: '诋毁其他基金管理人', max: 100}
        ],
        isTableLoading: false,
        countPerPage: 13,
        currentPage: 1,
        logDataCount: 13,
        chartTitle: {text: '违规得分趋势', left: 'left'},
        chartData: {},
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
        displayAppName: '全部应用',
        averageScore: 100,
        currentAppShopId: null,
        currentAppId: null,
        isApp: true,
        currentIndex: -1,
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
    },
    created() {
      this.dateValue = this.pickerOptions['shortcuts'][0].value.apply()
      getAllApplicationShop({}).then(res => {
        this.applicationShopData = res.data.data.data
        this.applicationShopData.forEach(applicationShop => {
          this.applicationShopToApkMapData[applicationShop.id] = []
          this.appShopIdToNameMap[applicationShop.id] = applicationShop.shopName
        })
        // 计算得分
        this.calculateViolationScore(0)
        this.calculateViolateScoreTendency(0)
      })
      this.getTaskResultData({page: 0, count: this.taskResultCountPerPage})
    },
    watch: {
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
    },
    methods: {
      calculateViolationScore(type, conditionIds = []) {
        this.fullscreenLoading = true
        calculateViolateScore(this.dateValue[0].format("yyyy-MM-dd"), this.dateValue[1].format("yyyy-MM-dd"), type, conditionIds).then(res => {
          this.displayAppName = res.data.data[0].name
          this.averageScore = res.data.data[0].averageScore
          let columns = res.data.data[0].dataBeanWrapper.columns
          let rows = res.data.data[0].dataBeanWrapper.rows
          let columnList = []
          let rowList = []
          for (let j = 1, len = columns.length; j < len; j++) {
            columnList.push({name: columns[j], max: 100},)
          }
          for (let j = 1, len = columns.length; j < len; j++) {
            rowList.push(rows[0][columns[j]])
          }
          this.scoreColumns = columnList
          this.scoreRows = rowList
          this.drawPie('main')
        }).finally(() => this.fullscreenLoading = false)
      },
      calculateViolateScoreTendency(type, conditionIds = []) {
        calculateViolateScoreTendency(this.dateValue[0].format("yyyy-MM-dd"), this.dateValue[1].format("yyyy-MM-dd"), type, conditionIds).then(res => {
          this.chartData = res.data.data
        })
      },
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
      },
      handleCloseApplication(index) {
        if (index === '-2') {
          this.currentTaskResultPage = 1
          this.currentAppShopId = null
          this.currentAppId = null
          // 计算得分
          this.calculateViolationScore(1)
          this.getTaskResultData({page: this.currentTaskResultPage - 1, count: this.countPerPage})
          return
        }
        if (index === '-1') {
          this.isApp = true
          this.currentAppShopId = null
          this.currentAppId = null
          // 计算得分
          this.calculateViolationScore(0)
        }
      },
      handleSelectApplication(index) {
        this.currentIndex = index
        this.isApp = false
        if (index === '-2') {
          this.currentTaskResultPage = 1
          this.currentAppShopId = null
          this.currentAppId = null
          // 计算得分
          this.calculateViolationScore(1)
          this.calculateViolateScoreTendency(1)
          this.getTaskResultData({page: this.currentTaskResultPage - 1, count: this.countPerPage})
          return
        }
        if (index === '-1') {
          this.isApp = true
          this.currentAppShopId = null
          this.currentAppId = null
          return
        }
        this.currentAppShopId = index
        this.apkOpenData = []
        this.disabled = true
        this.calculateViolateScoreTendency(1, [index])
        this.calculateViolationScore(1, [index])
        this.getApkDataByApplicationId(index)
      },
      handleSelectApk(index) {
        this.currentIndex = index
        this.isApp = true
        this.hasClickUp = true
        this.currentAppId = index
        this.hasClickUpConditions = [{
          "query": "app_id",
          "queryString": index
        }]
        this.isTaskResultLoading = true
        this.currentTaskResultPage = 1
        this.calculateViolationScore(0, [index])
        this.calculateViolateScoreTendency(0, [index])
        this.getHasClickUpData(this.hasClickUpConditions)
      },
      drawPie(elementId) {
        let charts = echarts.init(document.getElementById(elementId))
        let option = {
          title: {
            // text: "维度得分",
            link: 'https://www.baidu.com',
            target: "blank",
            left: 'top',
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
            data: []
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
            indicator: this.scoreColumns
          },
          series: [{
            name: this.displayAppName,
            type: 'radar',
            // areaStyle: {normal: {}},
            data: [
              {
                value: this.scoreRows,
                name: this.displayAppName
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
                  return `${a}\n{b|${this.scoreRows[i++]}}`
                }
              },
            }
          ]
        })
        window.addEventListener("resize", () => {
          charts.resize();
        });
      },
      getTaskResultData({page, count, conditions}) {
        this.isTaskResultLoading = true
        getTaskResults({page: page, count: count, conditions: conditions}).then(res => {
          this.taskResultDataCount = res.data.data.size
          this.taskResultData = res.data.data.data
          this.isTaskResultLoading = false
        })
      },
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
      },
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
      },
      dropDownSearch() {
        if (this.apkOpenData.length === 0) {
          return
        }
        if (this.searchValue === '') {
          this.apkOpenDisplayData = this.apkOpenData
        }
        this.apkOpenDisplayData = this.apkOpenData.filter(key => key.apkName.indexOf(this.searchValue) !== -1)
      },
      settingScoreConfig() {
        this.fullscreenLoading = true
        getAllViolateRuleConfigs({appId: this.currentAppId, appShopId: this.currentAppShopId}).then(res => {
          this.violateRuleConfigs = res.data.data
          this.editableTabsValue = this.violateRuleConfigs[0].id + ''
          this.addModal = true
        }).finally(() => this.fullscreenLoading = false)
      },
      asyncAddOK(params) {
        createOrUpdateViolateRuleConfigs(this.violateRuleConfigs).then(() => {
          this.addModal = false
          this.$Message.success("修改成功")
        })
      },
      cellDoubleClick(row, column, cell, event) {
        this.scoreEditShow = !this.scoreEditShow
      },
      flushDate() {
        this.calculateViolationScore(this.isApp ? 0 : 1, this.currentIndex === -1 || this.currentIndex === -2 ? [] : [this.currentIndex])
        this.calculateViolateScoreTendency(this.isApp ? 0 : 1, this.currentIndex === -1 || this.currentIndex === -2 ? [] : [this.currentIndex])
      }
    },
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
