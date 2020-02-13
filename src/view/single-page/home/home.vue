<template>
  <div>
    <Row :gutter="20">
      <i-col :xs="12" :md="8" :lg="4" v-for="(infor, i) in infoCardData" :key="`infor-${i}`"
             style="height: 120px;padding-bottom: 10px;">
        <infor-card shadow :color="infor.color" :icon="infor.icon" :icon-size="36">
          <count-to :end="infor.count" count-class="count-style"/>
          <p>{{ infor.title }}</p>
        </infor-card>
      </i-col>
    </Row>
    <Row :gutter="20" style="margin-top: 10px;">
      <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
        <Card shadow>
          <!--          <ve-line :data="chartData" height="400px"></ve-line>-->
          <!--          <ve-radar :data="chartData" height="400px"></ve-radar>-->
          <ve-pie :data="cycleJobChartData" height="400px" legend-position="left" :title="chartTitle"></ve-pie>
        </Card>
      </i-col>
      <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
        <Card shadow>
          <ve-histogram :data="chartData" height="400px" legend-position="bottom" :title="chartTitle"></ve-histogram>
        </Card>
      </i-col>
    </Row>
    <Row :gutter="20" style="margin-top: 10px;">
      <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
        <Card shadow>
          <chart-pie v-if="isShow" style="height: 300px;" :value="cycleJobData" text="定时任务统计"></chart-pie>
        </Card>
      </i-col>
      <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
        <Card shadow>
          <chart-pie v-if="isShow" style="height: 300px;" :value="violationItemPieData" text="违规项统计"></chart-pie>
        </Card>
      </i-col>
    </Row>
    <Row :gutter="20" style="margin-top: 10px;">
      <i-col :md="24" :lg="24" style="margin-bottom: 20px;">
        <Card shadow>
          <super_table :pageSize="countPerPage" :current.sync="currentPage" :data="logData" :columns="tableColumns"
                       :isLoading="isTableLoading" :dataNum="logDataCount"></super_table>
        </Card>
      </i-col>
    </Row>
  </div>
</template>

<script>
  import axios from '@/libs/api.request'
  import InforCard from '_c/info-card'
  import CountTo from '_c/count-to'
  import {ChartPie} from '_c/charts'
  import super_table from '@/components/table/supertable.vue'
  import {getAllLog} from '../../../api/log'
  import "echarts/lib/component/title";

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
        isTableLoading: false,
        countPerPage: 10,
        currentPage: 1,
        logDataCount: 0,
        logData: [],
        chartTitle: {text: '数量概览', left: 'center'},
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
        infoCardData: [
          {title: '应用商店数量', icon: 'md-person-add', count: 803, color: '#2d8cf0'},
          {title: '基金APP数量', icon: 'md-locate', count: 232, color: '#19be6b'},
          {title: '定时任务数量', icon: 'md-help-circle', count: 142, color: '#ff9900'},
          {title: '用户数量', icon: 'md-share', count: 657, color: '#ed3f14'},
          {title: 'APP路径数量', icon: 'md-chatbubbles', count: 12, color: '#E46CBB'},
          {title: '日志数量', icon: 'md-map', count: 14, color: '#9A66E4'},
          {title: '违规项数量', icon: 'ios-clipboard-outline', count: 14, color: '#ED55E4'},
          {title: '质检规则数量', icon: 'ios-cog', count: 14, color: '#E61A1A'},
          {title: '质检结果数量', icon: 'logo-buffer', count: 14, color: '#3A66F4'},
          {title: 'OCR方式', icon: 'md-basketball', count: 3, color: '#33CCAE'},
          {title: '规则匹配方式', icon: 'ios-boat', count: 5, color: '#B822DD'},
        ],
        cycleJobData: [
          {value: 1, name: '启用'},
          {value: 0, name: '禁用'},
          {value: 1, name: '运行中'},
          {value: 11, name: '停止'},
        ],
        violationItemPieData: [
          {value: 10, name: '重大违规'},
          {value: 10, name: '次要违规'},
          {value: 10, name: '普通违规'},
        ]
      }
    },
    created() {
      this.getLogTableData({page: 0, count: this.countPerPage})
      axios.request({
        url: '/fundApi/v1/common/index',
        methods: 'get'
      }).then(res => {
        this.infoCardData[0].count = res.data.data.applicationShopSize
        this.infoCardData[1].count = res.data.data.apkSize
        this.infoCardData[2].count = res.data.data.cycleJobSize
        this.infoCardData[3].count = res.data.data.userSize
        this.infoCardData[4].count = res.data.data.appPathSize
        this.infoCardData[5].count = res.data.data.logSize
        this.infoCardData[6].count = res.data.data.violationItemSize
        this.infoCardData[7].count = res.data.data.violationRuleSize
        this.infoCardData[8].count = res.data.data.taskResultSize
        this.infoCardData[9].count = res.data.data.ocrTypeSize
        this.infoCardData[10].count = res.data.data.judgeTypeSize

        this.chartData.rows[0]['数量'] = res.data.data.applicationShopSize
        this.chartData.rows[1]['数量'] = res.data.data.apkSize
        this.chartData.rows[2]['数量'] = res.data.data.cycleJobSize
        this.chartData.rows[3]['数量'] = res.data.data.userSize
        this.chartData.rows[4]['数量'] = res.data.data.appPathSize
        this.chartData.rows[5]['数量'] = res.data.data.logSize
        this.chartData.rows[6]['数量'] = res.data.data.violationItemSize
        this.chartData.rows[7]['数量'] = res.data.data.violationRuleSize
        this.chartData.rows[8]['数量'] = res.data.data.taskResultSize


        this.cycleJobChartData.rows[0]['数量'] = res.data.data.appScrapyCycleJobSize
        this.cycleJobChartData.rows[1]['数量'] = res.data.data.appScreenShotCycleJobSize
        this.cycleJobChartData.rows[2]['数量'] = res.data.data.appDetectCycleJobSize

        this.cycleJobData[0].value = res.data.data.normalCycleJobSize
        this.cycleJobData[1].value = res.data.data.forbidCycleJobSize
        this.cycleJobData[2].value = res.data.data.runningCycleJobSize
        this.cycleJobData[3].value = res.data.data.stopCycleJobSize

        this.violationItemPieData[0].value = res.data.data.deadlyViolationItemSize
        this.violationItemPieData[1].value = res.data.data.secondViolationItemSize
        this.violationItemPieData[2].value = res.data.data.ordinaryViolationItemSize
        this.isShow = true
      })
    },
    watch: {
      currentPage() {
        this.getLogTableData({page: this.currentPage - 1, count: this.countPerPage})
      }
    },
    methods: {
      getLogTableData({page, count}) {
        var that = this
        that.isTableLoading = true
        getAllLog({page: page, count: count}).then(res => {
          that.logDataCount = res.data.data.size
          that.logData = res.data.data.data
          that.isTableLoading = false
        })
      }
    }

  }
</script>

<style lang="less">
  .count-style {
    font-size: 50px;
  }
</style>
