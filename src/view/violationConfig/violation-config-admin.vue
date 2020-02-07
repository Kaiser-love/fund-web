<template>
  <div class="container" ref="container">
    <div class="top" v-bind:style="{ width: windowWidth*0.98 + 'px' }">
      <Card :bordered="false" v-bind:style="{ width: windowWidth*0.98 + 'px' }">
        <div slot="title">
          <Row justify="start" align="middle">
            <Col style="float:left"><p>违规项信息</p></Col>
            <Col style="float:right;display: inline;">
              <Button type="primary" @click="createOrUpdateViolationItem">新建违规项</Button>
              <Button type="primary" @click="violationItemDataReload" style="margin-left: 10px">刷新</Button>
            </Col>
          </Row>
        </div>
        <super_table :pageSize="countPerPage" @onSearch="onViolationItemSearch" @onClick="onViolationItemClick"
                     @onDoubleClick="createOrUpdateViolationItem"
                     :current.sync="currentViolationItemPage" :data="violationItemData" :columns="violationItemColumns"
                     :isLoading="isViolationItemLoading" :dataNum="violationItemDataCount"></super_table>
      </Card>
    </div>
    <div class="bottom">
      <Card :bordered="false" v-bind:style="{ width: windowWidth*0.98 + 'px' }">
        <div slot="title">
          <Row justify="center" align="middle">
            <Col style="float:left"><p>质检规则列表</p></Col>
            <Col style="float:right;display: inline;">
              <Button type="primary" @click="violationRuleDataReload" style="margin-left: 10px">刷新</Button>
            </Col>
          </Row>
        </div>
        <super_table :pageSize="countPerPage"
                     @onSearch="onViolationRuleSearch"
                     @onDoubleClick="onViolationRuleDoubleClick"
                     :current.sync="currentViolationRulePage"
                     :data="violationRuleData" :columns="violationRuleColumns" :isLoading="isViolationRuleLoading"
                     :dataNum="violationRuleDataCount"></super_table>
      </Card>
    </div>
    <div>
      <Card :bordered="false" v-bind:style="{ marginTop:'20px', width: windowWidth*0.98 + 'px' }">
        <div slot="title">
          <Row type="flex" justify="center" align="middle">
            <Col span="24"><p>添加质检规则</p></Col>
          </Row>
        </div>
        <Row justify="center" align="middle">
          <Col style="float:left">
            <span>匹配类型：</span>
            <Select style="margin-left:8px;width: 200px" v-model="judgeTypeMode">
              <Option v-for="(item) in judgeTypeList" :key="item.code" :value="item.code">{{item.desc}}</Option>
            </Select>
          </Col>
          <Col style="float:left;margin-left: 80px">
            <span style="margin-left:8px;">关键字或正则表达式：</span>
            <div style="display: inline-block;">
              <Input v-model="keywordExpr" placeholder="输入关键字或正则表达式" style="margin-left:8px;width: 200px">
              </Input>
            </div>
          </Col>
          <Col style="float:left;margin-left: 80px">
            <span style="margin-left:8px;">质检规则描述：</span>
            <div style="display: inline-block;">
              <Input v-model="ruleDesc" placeholder="输入质检规则描述" style="margin-left:8px;width: 200px">
              </Input>
            </div>
          </Col>
          <Col style="float:right">
            <Button style="float:right" type="primary" @click="onAddViolationRule">添加</Button>
          </Col>
        </Row>
      </Card>
    </div>
  </div>

</template>


<script>
  import apkExpand from '../../components/table/apk-expand.vue'
  import super_table from '@/components/table/supertable.vue'
  import {createOrUpdateViolationItem, deleteViolationItem, getAllViolationItem} from '../../api/violationItem'
  import {
    createOrUpdateViolationRule,
    deleteViolationRule,
    getAllViolationRule,
    getViolationRulesByItemId
  } from '../../api/violationRule'
  import {setQueryConditions} from '../../libs/util.js'
  import {createOrUpdateApkMessage, getAllApkMessage} from "../../api/apkMessage";
  import {createOrUpdateAppPath} from "../../api/appPath";
  import {getAllApplicationShop} from "../../api/applicationShop";
  import {getEnumTypes} from "../../api/metaApi";

  export default {
    components: {
      apkExpand,
      super_table
    },
    data() {
      return {
        judgeTypeMode: -1,
        ruleDesc: '',
        keywordExpr: '',
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
        andTypeList: [{
          code: '0',
          desc: '同时成立'
        }, {
          code: '1',
          desc: '部分成立'
        }],
        judgeTypeList: [],
        ruleTypeList: [],
        violationRuleList: [],
        applicationShopData: [],
        appData: [],
        violationItemStateDisAble: false,
        violationRuleStateDisAble: false,
        violationItemSearchState: 0,
        violationRuleSearchState: 0,
        violationItemSearchData: {},
        violationRuleSearchData: {},
        currentViolationRuleData: {},
        currentViolationItemData: {},
        windowWidth: 0,
        isViolationRuleLoading: false,
        isViolationItemLoading: false,
        violationRuleDataCount: 0,
        violationItemDataCount: 0,
        countPerPage: 5,
        violationRuleData: [],
        violationRuleColumns: [
          {
            type: 'index',
            width: 50,
            align: 'center',
            indexMethod: (row) => {
              return row._index + 1 + (this.currentViolationRulePage - 1) * this.countPerPage
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
            title: '匹配类型',
            key: 'judgeTypeDesc',
            filter: {
              type: 'Input'
            }
          },
          {
            title: '关键字',
            key: 'keyword',
          },
          {
            title: '质检规则描述',
            key: 'ruleDesc'
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
                  disabled: this.violationRuleStateDisAble
                },
                on: {
                  'on-change': (val) => {
                    this.violationRuleStateDisAble = true
                    if (val) {
                      params.row.state = 1
                    } else {
                      params.row.state = 0
                    }
                    createOrUpdateViolationRule(params.row).then(res => {
                      params.row.state = res.data.data.state
                      this.$Message.success("修改成功")
                    }).finally(this.violationRuleStateDisAble = false)
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
                      let temp = this.violationRuleData.find(function (item) {
                        return item.id === params.row.id
                      })
                      this.removeViolationRule(temp.id)
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],
        violationItemData: [],
        violationItemColumns: [
          {
            type: 'index',
            width: 50,
            align: 'center',
            indexMethod: (row) => {
              return row._index + 1 + (this.currentViolationRulePage - 1) * this.countPerPage
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
            key: 'appName',
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
            title: 'ocr检测方式',
            key: 'ocrTypeDesc',
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
            title: '匹配类型',
            key: 'andTypeDesc',
            filter: {
              type: 'Input'
            }
          },
          {
            title: '描述',
            key: 'violationItemDesc'
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
                  disabled: this.violationItemStateDisAble
                },
                on: {
                  'on-change': (val) => {
                    this.violationItemStateDisAble = true
                    if (val) {
                      params.row.state = 1
                    } else {
                      params.row.state = 0
                    }
                    createOrUpdateViolationItem(params.row).then(res => {
                      params.row.state = res.data.data.state
                      this.$Message.success("修改成功")
                    }).finally(this.violationItemStateDisAble = false)
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
                      let temp = this.violationItemData.find(function (item) {
                        return item.id === params.row.id
                      })
                      this.removeViolationItem(temp.id)
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],
        currentViolationRulePage: 1,
        currentViolationItemPage: 1,
        violationItemConditions: [],
        violationRuleConditions: [],
        hasClickUp: false,
        hasClickUpId: 0
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
      this.currentViolationRulePage = 1
      this.currentViolationItemPage = 1
      this.getViolationItemData({
        page: this.currentViolationItemPage - 1,
        count: this.countPerPage
      })
      this.getViolationRuleData({
        page: this.currentViolationRulePage - 1,
        count: this.countPerPage
      })
      getAllViolationRule({
        "page": 0,
        "count": 9999
      }).then(res => {
        this.violationRuleList = res.data.data.data
      })
      getAllApplicationShop({page: 0, count: 100}).then(res => {
        this.applicationShopData = res.data.data.data
      })
      getEnumTypes('ocrType').then(res => {
        this.ocrTypeList = res.data.data
      })
      getEnumTypes('andType').then(res => {
        this.andTypeList = res.data.data
      })
      getEnumTypes('judgeType').then(res => {
        this.judgeTypeList = res.data.data
      })
      getEnumTypes('ruleType').then(res => {
        this.ruleTypeList = res.data.data
      })
    },
    watch: {
      currentViolationRulePage() {
        if (this.hasClickUp) {
          this.getHasClickUpData(this.hasClickUpId, this.violationRuleConditions)
        } else {
          this.getViolationRuleData({
            page: this.currentViolationRulePage - 1,
            count: this.countPerPage
          })
        }
      },
      currentViolationItemPage() {
        this.getViolationItemData({
          page: this.currentViolationItemPage - 1,
          count: this.countPerPage,
          conditions: this.violationItemConditions
        })
      }
    },
    computed: {},
    methods: {
      onAddViolationRule() {
        if (this.judgeTypeMode === -1 || this.keywordExpr === '' || this.ruleDesc === '') {
          this.$Message.error('请配置质检规则后在点击哦')
          return;
        }
        createOrUpdateViolationRule({
          "id": 0,
          "keyword": this.keywordExpr,
          "ruleDesc": this.ruleDesc,
          "judgeType": this.judgeTypeMode
        }).then(res => {
          this.violationRuleDataReload()
          this.$Message.success('新增质检规则成功')
        })
      },
      getViolationRuleData({page, count, conditions = []}) {
        var that = this
        that.isViolationRuleLoading = true
        getAllViolationRule({
          "page": page,
          "count": count,
          "conditions": conditions
        }).then(res => {
          const data = res.data.data.data
          that.violationRuleDataCount = res.data.data.size
          that.violationRuleData = data
          that.isViolationRuleLoading = false
        })
      },
      removeViolationRule(id) {
        var that = this
        let dId = id
        this.$Modal.confirm({
          title: '警告',
          content: '该操作会导致该质检规则永远从数据库移除，确定删除该质检规则吗？（非专业人员和维护人员请勿执行此操作）',
          onOk: function () {
            deleteViolationRule(dId).then(res => {
              this.$message.success("删除成功")
              that.getViolationRuleData({
                page: that.currentViolationRulePage - 1,
                count: that.countPerPage,
                conditions: that.violationRuleConditions
              })
            })
          }
        })
      },
      removeViolationItem(id) {
        var that = this
        let dId = id
        this.$Modal.confirm({
          title: '警告',
          content: '该操作会导致该违规项数据永远从数据库移除，确定删除该违规项吗？（非专业人员和维护人员请勿执行此操作）',
          onOk: function () {
            deleteViolationItem(dId).then(res => {
              that.getViolationItemData({
                page: that.currentViolationItemPage - 1,
                count: that.countPerPage,
                conditions: that.violationItemConditions
              })
            })
          }
        })
      },
      onViolationItemSearch(search) {
        this.violationItemSearchData = search
        const keys = Object.keys(search)
        if (keys.length === 0) {
          this.violationItemSearchState = 0
          this.getViolationItemData({page: this.currentViolationItemPage - 1, count: this.countPerPage})
          return
        }
        this.currentViolationItemPage = 1
        this.violationItemConditions = []
        setQueryConditions(keys, search, this.violationItemConditions, false)
        this.getViolationItemData({
          page: 0,
          count: this.countPerPage,
          conditions: this.violationItemConditions
        })
        this.violationItemSearchState = 1
      },
      onViolationRuleSearch(search) {
        this.violationRuleSearchData = search
        const keys = Object.keys(search)
        if (keys.length === 0) {
          this.violationRuleSearchData = 0
          if (this.hasClickUp) {
            this.getHasClickUpData(this.hasClickUpId, [])
          } else {
            this.getViolationRuleData({
              page: 0,
              count: this.countPerPage
            })
          }
          return
        }
        this.currentViolationRulePage = 1
        this.violationRuleConditions = []
        setQueryConditions(keys, search, this.violationRuleConditions)
        if (this.hasClickUp) {
          this.getHasClickUpData(this.hasClickUpId, this.violationRuleConditions)
        } else {
          this.getViolationRuleData({
            page: 0,
            count: this.countPerPage,
            conditions: this.violationRuleConditions
          })
        }
        this.violationRuleSearchState = 1
      },
      getViolationItemData({page, count, conditions = []}) {
        this.violationItemSearchState = 0
        const that = this
        that.isViolationItemLoading = true
        getAllViolationItem({page: page, count: count, conditions: conditions}).then(res => {
          const data = res.data.data.data
          that.violationItemDataCount = res.data.data.size
          that.violationItemData = data
          that.isViolationItemLoading = false
        })
      },
      violationItemDataReload() {
        if (this.violationItemSearchState === 0) {
          this.getViolationItemData({
            page: this.currentViolationRulePage - 1,
            count: this.countPerPage
          })
        } else {
          this.onViolationItemSearch(this.violationItemSearchData)
        }
      },
      violationRuleDataReload() {
        this.hasClickUp = false
        this.hasClickUpId = 0
        if (this.violationRuleSearchState === 0) {
          this.currentViolationRulePage = 1
          this.getViolationRuleData({
            page: this.currentViolationRulePage - 1,
            count: this.countPerPage
          })
        } else {
          this.onViolationRuleSearch(this.violationRuleSearchData)
        }
      },
      onViolationItemClick(currentRow) {
        if (currentRow.id === '' || currentRow.id === 0) {
          this.violationRuleData = []
          return
        }
        this.hasClickUp = true
        this.isViolationRuleLoading = true
        this.currentViolationRulePage = 1
        this.hasClickUpId = currentRow.id
        this.violationRuleSearchData = {}
        this.violationRuleSearchState = 0
        this.violationRuleConditions = []
        this.getHasClickUpData(this.hasClickUpId, [])
      },
      getHasClickUpData(id, conditions) {
        getViolationRulesByItemId({
          "page": 0,
          "count": this.countPerPage,
          "id": id,
          "conditions": conditions
        }).then(res => {
          this.violationRuleDataCount = res.data.data.size
          this.violationRuleData = res.data.data.data
          this.isViolationRuleLoading = false
        }).catch(() => {
            this.isViolationRuleLoading = false
            this.hasClickUp = false
            this.hasClickUpId = 0
          }
        )
      },
      createOrUpdateViolationItem(currentRow) {
        var that = this
        // 更新操作
        if (currentRow.altKey === undefined) {
          this.currentViolationItemData = currentRow
          getAllApkMessage({
            page: 0,
            count: 9999,
            conditions: [{
              "query": "app_shop_id",
              "connection": "=",
              "queryString": this.currentViolationItemData.appShopId
            }]
          }).then(res => {
            that.appData = res.data.data.data
          })
        } else {
          this.currentViolationItemData.id = 0
        }
        this.$Modal.confirm({
          title: '新建违规项',
          width: '650',
          render: (h, params) => {
            return h('span', [
              h('p', '匹配类型:'),
              h('Select', {
                  props: {
                    size: "large",
                    value: this.currentViolationItemData.andType === undefined ? 0 : this.currentViolationItemData.andType
                  },
                  on: {
                    'on-change': (val) => {
                      this.currentViolationItemData.andType = val
                    }
                  }
                },
                that.andTypeList.map((item) => {
                  return h('Option', {
                    props: {
                      value: item.code,
                      label: item.desc
                    }
                  })
                })
              ),
              h('p', '违规类型:'),
              h('Select', {
                  props: {
                    size: "large",
                    value: this.currentViolationItemData.ruleType === undefined ? 0 : this.currentViolationItemData.ruleType
                  },
                  on: {
                    'on-change': (val) => {
                      this.currentViolationItemData.ruleType = val
                    }
                  }
                },
                this.ruleTypeList.map((item) => {
                  return h('Option', {
                    props: {
                      value: item.code,
                      label: item.desc
                    }
                  })
                })
              ),
              h('p', '违规项标签:'),
              h('Input', {
                props: {
                  placeholder: '输入违规项标签',
                  value: this.currentViolationItemData.label,
                  size: "large",
                  clearable: true,
                  autosize: true
                },
                on: {
                  'on-change': (event) => {
                    this.currentViolationItemData.label = event.target.value
                  }
                }
              }),
              h('p', '应用商店:'),
              h('Select', {
                  props: {
                    size: "large",
                    value: this.currentViolationItemData.appShopId
                  },
                  on: {
                    'on-change': (val) => {
                      this.currentViolationItemData.appShopId = val
                      getAllApkMessage({
                        page: 0,
                        count: 9999,
                        conditions: [{
                          "query": "app_shop_id",
                          "connection": "=",
                          "queryString": this.currentViolationItemData.appShopId
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
                    size: "large",
                    value: this.currentViolationItemData.appId
                  },
                  on: {
                    'on-change': (val) => {
                      this.currentViolationItemData.appId = val
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
              h('p', 'OCR检测方式:'),
              h('Select', {
                  props: {
                    size: "large",
                    value: this.currentViolationItemData.ocrType
                  },
                  on: {
                    'on-change': (val) => {
                      this.currentViolationItemData.ocrType = val
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
              h('p', '违规项描述:'),
              h('Input', {
                props: {
                  placeholder: '输入违规项描述',
                  value: this.currentViolationItemData.violationItemDesc,
                  size: "large",
                  clearable: true,
                  type: "textarea",
                  autosize: true
                },
                on: {
                  'on-change': (event) => {
                    this.currentViolationItemData.violationItemDesc = event.target.value
                  }
                }
              }),
              h('p', '质检规则:'),
              h('Select', {
                  props: {
                    size: "large",
                    multiple: 'true',
                    value: this.currentViolationItemData.violationRuleIds
                  },
                  on: {
                    'on-change': (val) => {
                      this.currentViolationItemData.violationRuleIds = val
                    }
                  }
                },
                that.violationRuleList.map((item) => {
                  return h('Option', {
                    props: {
                      value: item.id,
                      label: item.ruleDesc
                    }
                  })
                })
              ),
            ])
          },
          onOk: () => {
            that.editViolationItemOK()
          }
        })
      },
      editViolationItemOK() {
        createOrUpdateViolationItem(this.currentViolationItemData).then(res => {
          this.getViolationItemData({page: this.currentViolationItemPage - 1, count: this.countPerPage})
          this.$message.success("操作成功")
        })
      },
      onViolationRuleDoubleClick(currentRow) {
        var that = this
        this.currentViolationRuleData = currentRow
        this.$Modal.confirm({
          title: '修改质检规则',
          render: (h, params) => {
            return h('span', [
              h('p', '匹配类型:'),
              h('Select', {
                  props: {
                    size: "large",
                    value: this.currentViolationRuleData.judgeType === undefined ? 0 : this.currentViolationRuleData.judgeType
                  },
                  on: {
                    'on-change': (val) => {
                      this.currentViolationRuleData.judgeType = val
                    }
                  }
                },
                this.judgeTypeList.map((item) => {
                  return h('Option', {
                    props: {
                      value: item.code,
                      label: item.desc
                    }
                  })
                })
              ),
              h('p', '关键字或正则表达式:'),
              h('Input', {
                props: {
                  placeholder: '输入关键字或正则表达式',
                  value: this.currentViolationRuleData.keyword,
                  size: "large",
                  clearable: true,
                  autosize: true
                },
                on: {
                  'on-change': (event) => {
                    this.currentViolationRuleData.keyword = event.target.value
                  }
                }
              }),
              h('p', '质检规则描述:'),
              h('Input', {
                props: {
                  placeholder: '输入质检规则描述',
                  value: this.currentViolationRuleData.ruleDesc,
                  size: "large",
                  clearable: true,
                  autosize: true
                },
                on: {
                  'on-change': (event) => {
                    this.currentViolationRuleData.ruleDesc = event.target.value
                  }
                }
              }),
            ])
          },
          onOk: () => {
            that.editViolationRuleOK()
          }
        })
      },
      editViolationRuleOK() {
        createOrUpdateViolationRule(this.currentViolationRuleData).then(res => {
          this.getViolationRuleData({page: this.currentViolationRulePage - 1, count: this.countPerPage})
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
