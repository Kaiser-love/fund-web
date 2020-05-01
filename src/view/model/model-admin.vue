<template>
  <el-row style="background-color: #FFFFFF">
    <el-col :span="6" class="down-tree">
      <el-row style="background-color: #FFFFFF">
        <el-col style="height:29px;float:left;font-size: 19px;display:flex;justify-content: space-between;">
          <p style="margin-top: 2px;background-color: #FFFFFF">业务场景</p>
          <el-button type="info" plain size="small" @click="createModelCategoryName" icon="el-icon-plus"></el-button>
        </el-col>
      </el-row>
      <el-tree :data="data" @node-click="handleNodeClick"
               style="background-color: #FFFFFF">
              <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span v-show="node.label!=='全部业务场景'">
          <el-button v-show="data.isModelCategory"
                     type="text"
                     size="mini"
                     icon="el-icon-plus"
                     default-expand-all circle
                     @click="() => createViolateModel(data)">
          </el-button>
          <el-button
            type="text"
            size="mini"
            icon="el-icon-edit-outline"
            default-expand-all circle
            @click="() => changeModelCategoryName(data)">
          </el-button>
          <el-button
            type="text"
            size="mini"
            icon="el-icon-close"
            default-expand-all circle
            @click="() => deleteModelCategoryName(data)">
          </el-button>
        </span>
      </span>
      </el-tree>
    </el-col>
    <el-col :span="18">
      <el-col>
        <Card>
          <div slot="title">
            <Row justify="center" align="middle">
              <Col style="float:left"><p>已标注数据</p></Col>
              <Col style="float:right;display: inline;">
                <Button type="primary" @click="testModel" style="margin-left: 10px">模型测试</Button>
                <Button type="primary" @click="callTrainModel" style="margin-left: 10px">训练模型</Button>
                <Button type="primary" @click="markingDataReload" style="margin-left: 10px">刷新</Button>
              </Col>
            </Row>
          </div>
          <super_table :pageSize="countPerPage"
                       @onDoubleClick="updateMarkingData"
                       :current.sync="currentMarkingDataPage"
                       :data="markingData" :columns="markingColumns" :isLoading="isMarkingDataLoading"
                       :dataNum="markingDataCount"></super_table>
        </Card>
      </el-col>
      <el-col>
        <Card style="margin-top: 20px">
          <div slot="title">
            <Row justify="center" align="middle">
              <Col style="float:left"><p>可标注数据</p></Col>
              <Col style="float:right;display: inline;">
                <Button type="primary" @click="createOrUpdateAnnotationData">添加可标注数据</Button>
                <Button type="primary" @click="annotationDataReload" style="margin-left: 10px">刷新</Button>
              </Col>
            </Row>
          </div>
          <super_table :pageSize="countPerPage"
                       @onDoubleClick="createOrUpdateAnnotationData"
                       :current.sync="currentAnnotationDataPage"
                       :data="annotationData" :columns="annotationDataColumns" :isLoading="isAnnotationDataLoading"
                       :dataNum="annotationDataCount"></super_table>
        </Card>
      </el-col>
    </el-col>
  </el-row>
</template>


<script>
  import super_table from '@/components/table/supertable.vue'
  import {mapActions} from "vuex";
  import {
    getAnnotationDataList,
    getModelMenu,
    updateAnnotationData,
    addAnnotationData,
    deleteViolateModel,
    createOrUpdateViolateModel,
    createOrUpdateModelCategory,
    deleteModelCategory,
    trainModel,
    predictTag
  } from '../../api/violateModel'
  import {getAllAnnotationData, createOrUpdateAnnotationData, deleteAnnotationData} from '../../api/annotationData'

  export default {
    components: {
      super_table
    },
    data() {
      return {
        data: [{
          index: 0,
          label: '全部业务场景',
          isModelCategory: true,
          children: []
          //   [{
          //   index: 1,
          //   label: '夸大收益-业务场景',
          //   isModelCategory: true,
          //   children: [{
          //     index: 1,
          //     label: '夸大收益',
          //     isModelCategory: false
          //   }]
          // }, {
          //   index: 2,
          //   label: '诋毁其他基金管理人-业务场景',
          //   isModelCategory: true,
          //   children: [{
          //     index: 1,
          //     label: '诋毁其他基金管理人',
          //     isModelCategory: false
          //   }]
          // }]
        }],
        isEditModelCategory: false,
        stateDisable: false,
        currentMarkingData: {},
        currentAnnotationData: {},
        windowWidth: 0,
        isMarkingDataLoading: false,
        isAnnotationDataLoading: false,
        countPerPage: 5,
        markingData: [],
        annotationData: [],
        markingColumns: [
          {
            type: 'index',
            width: 75,
            align: 'center',
            indexMethod: (row) => {
              return row._index + 1 + (this.currentMarkingDataPage - 1) * this.countPerPage
            }
          },
          {
            title: '文本',
            key: "text"
          },
          {
            title: '是否违规',
            key: 'label',
            width: 100,
            render: (h, params) => {
              const row = params.row
              const color = row.label === "1" ? 'error' : 'primary'
              const text = row.label === "1" ? '违规' : '正常'
              return h('Tag', {
                props: {
                  type: 'dot',
                  color: color
                }
              }, text)
            },
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
                      let temp = this.markingData.find(function (item) {
                        return item.id === params.row.id
                      })
                      this.removeMarkingData(temp)
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],
        annotationDataColumns: [
          {
            type: 'index',
            width: 75,
            align: 'center',
            indexMethod: (row) => {
              return row._index + 1 + (this.currentMarkingDataPage - 1) * this.countPerPage
            }
          },
          {
            title: '标注文本名',
            key: "annotationDataName",
            width: 120,
          },
          {
            title: '标注文本描述',
            key: "annotationDataDesc",
            width: 120,
          },
          {
            title: '文本',
            key: "keyword"
          },
          {
            title: '是否违规',
            key: 'label',
            render: (h, params) => {
              const row = params.row
              let color
              let text
              if (row.label === 1) {
                color = 'error'
                text = '违规'
              } else if (row.label === 0) {
                color = 'primary'
                text = '正常'
              } else {
                color = 'info'
                text = '待标注'
              }
              return h('Tag', {
                props: {
                  type: 'dot',
                  color: color
                }
              }, text)
            },
          },
          {
            title: '创建者',
            width: 40,
            key: 'createUserName'
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
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    margin: '2px'
                  },
                  on: {
                    'click': (event) => {
                      if (this.currentModelId === -1) {
                        this.$message.error("请先选择具体的模型")
                        return
                      }
                      event.stopPropagation()
                      let temp = this.annotationData.find(function (item) {
                        return item.id === params.row.id
                      })
                      const that = this;
                      this.$Modal.confirm({
                        title: '警告',
                        content: '确定要将此条数据加入当前模型的标注数据中吗?',
                        onOk: function () {
                          addAnnotationData(that.currentModelId, temp.id).then(res => {
                            that.$message.success("添加成功")
                            that.getAnnotationData({
                              page: that.currentAnnotationDataPage - 1,
                              count: that.countPerPage
                            })
                          })
                        }
                      })
                    }
                  }
                }, '标注'),
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
                      let temp = this.annotationData.find(function (item) {
                        return item.id === params.row.id
                      })
                      const that = this;
                      this.$Modal.confirm({
                        title: '警告',
                        content: '该操作会导致该标注数据永远从数据库移除，确定执行该操作吗？（非专业人员和维护人员请勿执行此操作）',
                        onOk: function () {
                          deleteAnnotationData(temp.id).then(res => {
                            that.$message.success("删除成功")
                            that.getAnnotationData({
                              page: that.currentAnnotationDataPage - 1,
                              count: that.countPerPage
                            })
                          })
                        }
                      })
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],
        currentMarkingDataPage: 1,
        markingDataCount: 0,
        currentAnnotationDataPage: 1,
        annotationDataCount: 0,
        userConditions: [],
        currentModelId: -1,
        labelList: [{
          code: "0",
          desc: "正常"
        }, {
          code: "1",
          desc: "违规"
        }],
        labelList1: [{
          code: -1,
          desc: "待标注"
        }, {
          code: 0,
          desc: "正常"
        }, {
          code: 1,
          desc: "违规"
        }],
      }
    },
    mounted() {
    },
    created() {
      this.currentAnnotationDataPage = 1
      this.getAnnotationData({
        page: this.currentAnnotationDataPage - 1,
        count: this.countPerPage
      })
      this.getModelMenuData()
      this.currentMarkingDataPage = 1
      this.markingDataReload()
    },
    watch: {
      currentMarkingDataPage() {
        this.getMarkingData({
          page: this.currentMarkingDataPage - 1,
          count: this.countPerPage
        })
      },
      currentAnnotationDataPage() {
        this.getAnnotationData({
          page: this.currentAnnotationDataPage - 1,
          count: this.countPerPage
        })
      },
    },
    computed: {},
    methods: {
      ...mapActions([
        'handleLogOut'
      ]),
      handleNodeClick(data) {
        console.log(this.data)
        if (data.isModelCategory) {
          this.currentModelId = -1
          return
        }
        if (!this.isEditModelCategory) {
          this.currentModelId = data.index
          this.getMarkingData({
            page: this.currentMarkingDataPage - 1,
            count: this.countPerPage
          })
        }
      },
      createModelCategoryName() {
        const that = this
        let modelCategoryName = ''
        this.$Modal.confirm({
          render: (h, params) => {
            return h('span', [
              h('p', '模型业务场景'),
              h('Input', {
                props: {
                  placeholder: '输入模型业务场景',
                  value: modelCategoryName,
                  clearable: true,
                },
                on: {
                  'on-change': (event) => {
                    modelCategoryName = event.target.value
                  }
                }
              })])
          },
          onOk: () => {
            createOrUpdateModelCategory(0, modelCategoryName).then(res => {
              this.$message.success("新建模型场景成功")
              that.getModelMenuData()
            })
          }
        })
      },
      changeModelCategoryName(data) {
        const that = this
        this.isEditModelCategory = true
        let modelCategoryName = data.label;
        this.$Modal.confirm({
          render: (h, params) => {
            return h('span', [
              h('p', data.isModelCategory ? '模型业务场景' : '模型'),
              h('Input', {
                props: {
                  placeholder: data.isModelCategory ? '输入模型业务场景' : '输入模型名',
                  value: modelCategoryName,
                  clearable: true,
                },
                on: {
                  'on-change': (event) => {
                    modelCategoryName = event.target.value
                  }
                }
              })])
          },
          onOk: () => {
            if (data.isModelCategory) {
              createOrUpdateModelCategory(data.index, modelCategoryName).then(res => {
                this.$message.success("修改模型场景名成功")
                that.getModelMenuData()
              })
            } else {
              createOrUpdateViolateModel(data.index, null, modelCategoryName).then(res => {
                this.$message.success("修改模型名成功")
                that.getModelMenuData()
              })
            }
          }
        })
        this.isEditModelCategory = false
      },
      deleteModelCategoryName(data) {
        const that = this
        this.isEditModelCategory = true
        let modelCategoryName = data.label;
        this.$Modal.confirm({
          title: '警告',
          content: '该操作会导致' + modelCategoryName + '永远从数据库移除，确定执行该操作吗？（非专业人员和维护人员请勿执行此操作）',
          onOk: function () {
            if (data.isModelCategory) {
              deleteModelCategory(data.index).then(res => {
                this.$message.success("删除成功")
                that.getModelMenuData()
              })
            } else {
              deleteViolateModel(data.index).then(res => {
                  this.$message.success("删除成功")
                  that.getModelMenuData()
                }
              )
            }
          }
        })
        this.isEditModelCategory = false
      },
      createViolateModel(data) {
        const that = this
        this.isEditModelCategory = true
        let modelName = '';
        this.$Modal.confirm({
          render: (h, params) => {
            return h('span', [
              h('p', '模型'),
              h('Input', {
                props: {
                  placeholder: '输入模型名',
                  value: modelName,
                  clearable: true,
                },
                on: {
                  'on-change': (event) => {
                    modelName = event.target.value
                  }
                }
              })])
          },
          onOk: () => {
            createOrUpdateViolateModel(0, data.index, modelName).then(res => {
              this.$message.success("添加成功")
              that.getModelMenuData()
            })
          }
        })
        this.isEditModelCategory = false
      },
      getModelMenuData() {
        getModelMenu().then(res => {
          this.data[0].children = res.data.data
        })
      },
      getMarkingData({page, count}) {
        this.isMarkingDataLoading = true
        getAnnotationDataList(page, count, this.currentModelId).then(res => {
          const data = res.data.data.data
          this.markingDataCount = res.data.data.size
          this.markingData = data
          this.isMarkingDataLoading = false
        })
      },
      removeMarkingData(temp) {
        var that = this
        this.$Modal.confirm({
          title: '警告',
          content: '该操作会导致该标注数据永远从数据库移除，确定执行该操作吗？（非专业人员和维护人员请勿执行此操作）',
          onOk: function () {
            temp.exist = 0
            updateAnnotationData(that.currentModelId, temp.id, temp).then(res => {
              that.$message.success("删除成功")
              that.getMarkingData({
                page: that.currentMarkingDataPage - 1,
                count: that.countPerPage
              })
            })
          }
        })
      },
      markingDataReload() {
        if (this.currentModelId === -1) {
          return
        }
        this.getMarkingData({
          page: this.currentMarkingDataPage - 1,
          count: this.countPerPage
        })
      },
      annotationDataReload() {
        this.getAnnotationData({
          page: this.currentAnnotationDataPage - 1,
          count: this.countPerPage
        })
      },
      updateMarkingData(currentRow) {
        this.currentMarkingData = currentRow
        console.log(this.currentMarkingData)
        this.$Modal.confirm({
          title: '修改标注数据',
          render: (h, params) => {
            return h('span', [
              h('p', '文本:'),
              h('Input', {
                props: {
                  placeholder: '输入文本',
                  value: this.currentMarkingData.text,
                  clearable: true,
                },
                on: {
                  'on-change': (event) => {
                    this.currentMarkingData.text = event.target.value
                  }
                }
              }),
              h('p', '标签:'),
              h('Select', {
                  props: {
                    value: this.currentMarkingData.label
                  },
                  on: {
                    'on-change': (val) => {
                      this.currentMarkingData.label = val
                    }
                  }
                },
                this.labelList.map((item) => {
                  return h('Option', {
                    props: {
                      value: item.code,
                      label: item.desc
                    }
                  })
                })
              ),
            ])
          },
          onOk: () => {
            this.currentMarkingData.exist = 1
            updateAnnotationData(this.currentModelId, this.currentMarkingData.id, this.currentMarkingData).then(res => {
              this.getMarkingData({
                page: this.currentMarkingDataPage - 1,
                count: this.countPerPage
              })
            })
          }
        })
      },
      getAnnotationData({page, count}) {
        this.isAnnotationDataLoading = true
        getAllAnnotationData({"page": page, "count": count}).then(res => {
          this.annotationDataCount = res.data.data.size
          this.annotationData = res.data.data.data
          this.isAnnotationDataLoading = false
        })
      },
      createOrUpdateAnnotationData(currentRow) {
        if (currentRow.altKey === undefined) {
          this.currentAnnotationData = currentRow
        } else {
          this.currentAnnotationData.id = 0
        }
        const disabled = currentRow.id !== undefined;
        this.$Modal.confirm({
          title: disabled ? '修改标注数据' : '新建标注数据',
          render: (h, params) => {
            return h('span', [
              h('p', '标注数据名:'),
              h('Input', {
                props: {
                  placeholder: '输入标注数据名',
                  value: this.currentAnnotationData.annotationDataName,
                  clearable: true,
                },
                on: {
                  'on-change': (event) => {
                    this.currentAnnotationData.annotationDataName = event.target.value
                  }
                }
              }),
              h('p', '标注数据描述:'),
              h('Input', {
                props: {
                  placeholder: '输入标注数据描述',
                  value: this.currentAnnotationData.annotationDataDesc,
                  clearable: true,
                },
                on: {
                  'on-change': (event) => {
                    this.currentAnnotationData.annotationDataDesc = event.target.value
                  }
                }
              }),
              h('p', '文本:'),
              h('Input', {
                props: {
                  placeholder: '输入文本',
                  value: this.currentAnnotationData.keyword,
                  clearable: true,
                },
                on: {
                  'on-change': (event) => {
                    this.currentAnnotationData.keyword = event.target.value
                  }
                }
              }),
              h('p', '标签:'),
              h('Select', {
                  props: {
                    value: this.currentAnnotationData.label
                  },
                  on: {
                    'on-change': (val) => {
                      this.currentAnnotationData.label = val
                    }
                  }
                },
                this.labelList1.map((item) => {
                  return h('Option', {
                    props: {
                      value: item.code,
                      label: item.desc
                    }
                  })
                })
              ),
            ])
          },
          onOk: () => {
            createOrUpdateAnnotationData(this.currentAnnotationData).then(res => {
              this.getAnnotationData({
                page: this.currentAnnotationDataPage - 1,
                count: this.countPerPage
              })
            })
          }
        })
      },
      callTrainModel() {
        if (this.currentModelId === -1) {
          this.$message.error("请先选择具体的模型")
          return
        }
        trainModel(this.currentModelId).then(res => {
          this.$message.success("发送训练模型命令成功")
        })
      },
      testModel() {
        if (this.currentModelId === -1) {
          this.$message.error("请先选择具体的模型")
          return
        }
        let testText = ''
        this.$Modal.confirm({
          title: '模型测试',
          render: (h, params) => {
            return h('span', [
              h('p', '文本:'),
              h('Input', {
                props: {
                  placeholder: '输入需要预测的文本',
                  value: testText,
                  clearable: true,
                },
                on: {
                  'on-change': (event) => {
                    testText = event.target.value
                  }
                }
              }),
            ])
          },
          onOk: () => {
            predictTag(this.currentModelId, testText).then(res => {
              if (res.data.data === -1) {
                this.$message.error("模型预测异常")
                return;
              }
              this.$message({
                showClose: true,
                duration: 6000,
                type: 'success',
                message: res.data.data === 1 ? `${testText}为违规样本` : `${testText}为正常样本`
              });
            })
          }
        })
      }
    },
  }
</script>
<style>
  .top {
    flex-shrink: 1;
    display: flex;
  }

  .down-tree {
    background: rgba(245, 248, 250, 1);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: bold;
  }

  .el-tree-node.is-current > .el-tree-node__content {
    background-color: #FFFFBB !important;
  }

  .el-tree-node__content {
    font-size: 20px;
    height: 40px;
    font-weight: 400;
  }

  .el-tree-node__label:hover {
    color: #0593D3;
  }

  .el-tree-node:focus > .el-tree-node__content {
    color: #0593D3;
  }

  .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
    color: red;
    background-color: transparent;
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }

  button {
    outline: none;
  }
</style>
