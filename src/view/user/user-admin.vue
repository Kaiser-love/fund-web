<template>
  <div class="container" ref="container">
    <div class="top">
      <Card :bordered="false" v-bind:style="{ width: windowWidth*0.98 + 'px' }">
        <div slot="title">
          <Row type="flex" justify="center" align="middle">
            <Col span="22"><p>用户信息</p></Col>
            <Col span="2">
              <Button type="primary" @click="createOrUpdateUser">添加用户</Button>
              <Button type="primary" @click="userDataReload" style="margin-left: 10px">刷新</Button>
            </Col>
          </Row>
        </div>
        <super_table :pageSize="countPerPage"
                     @onSearch="onUserSearch"
                     @onDoubleClick="createOrUpdateUser"
                     :current.sync="currentUserPage"
                     :data="userData" :columns="userColumns" :isLoading="isUserLoading"
                     :dataNum="userDataCount"></super_table>
      </Card>
    </div>
  </div>

</template>


<script>
  import super_table from '@/components/table/supertable.vue'
  import {deleteUsers, getUsers, createOrUpdateUser} from '../../api/user'
  import {setQueryConditions} from '../../libs/util.js'

  export default {
    components: {
      super_table
    },
    data() {
      return {
        userSearchState: 0,
        userSearchData: {},
        currentUserData: {},
        windowWidth: 0,
        isUserLoading: false,
        userDataCount: 0,
        countPerPage: 10,
        userData: [],
        userColumns: [
          {
            type: 'index',
            width: 75,
            align: 'center',
            indexMethod: (row) => {
              return row._index + 1 + (this.currentUserPage - 1) * this.countPerPage
            }
          },
          {
            title: '创建者',
            width: '150',
            key: "createUserName"
          },
          {
            title: '部门',
            key: 'department',
            width: '202',
            filter: {
              type: 'Input'
            }
          },
          {
            title: '姓名',
            key: 'realName',
            width: '200'
          },
          {
            title: '用户名',
            key: 'userName',
            width: '200'
          },
          {
            title: '邮箱',
            key: 'mail',
            width: '200'
          },
          {
            title: '电话',
            width: '200',
            key: 'phone'
          },
          {
            title: '创建时间',
            width: '200',
            key: 'createTime'
          },
          {
            title: '最近更新时间',
            key: 'updateTime',
            width: '200'
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
                      let temp = this.userData.find(function (item) {
                        return item.id === params.row.id
                      })
                      this.removeUser(temp.id)
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],
        currentUserPage: 1,
        userConditions: []
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
      this.currentUserPage = 1
      this.getUserData({
        page: this.currentUserPage - 1,
        count: this.countPerPage
      })
    },
    watch: {
      currentUserPage() {
        this.getUserData({
          page: this.currentUserPage - 1,
          count: this.countPerPage
        })
      },
    },
    computed: {},
    methods: {
      getUserData({page, count, conditions = []}) {
        var that = this
        that.isUserLoading = true
        getUsers({
          "page": page,
          "count": count,
          "conditions": conditions
        }).then(res => {
          const data = res.data.data.data
          that.userDataCount = res.data.data.size
          that.userData = data
          that.isUserLoading = false
        })
      },
      removeUser(id) {
        var that = this
        let dId = id
        this.$Modal.confirm({
          title: '警告',
          content: '该操作会导致用户永远从数据库移除，确定删除该用户吗？（非专业人员和维护人员请勿执行此操作）',
          onOk: function () {
            deleteUsers(dId).then(res => {
              this.$message.success("删除成功")
              that.getUserData({
                page: that.currentUserPage - 1,
                count: that.countPerPage
              })
            })
          }
        })
      },
      onUserSearch(search) {
        this.userSearchData = search
        const keys = Object.keys(search)
        if (keys.length === 0) {
          this.userSearchState = 0
          this.getUserData({page: this.currentUserPage - 1, count: this.countPerPage})
          return
        }
        this.currentUserPage = 1
        this.userConditions = []
        setQueryConditions(keys, search, this.userConditions)
        this.getUserData({
          page: 0,
          count: this.countPerPage,
          conditions: this.userConditions
        })
        this.userSearchState = 1
      },
      userDataReload() {
        if (this.userSearchState === 0) {
          this.getUserData({
            page: this.currentUserPage - 1,
            count: this.countPerPage
          })
        } else {
          this.onUserSearch(this.userSearchData)
        }
      },
      createOrUpdateUser(currentRow) {
        var that = this
        if (currentRow.altKey === undefined) {
          this.currentUserData = currentRow
        } else {
          this.currentUserData.id = 0
        }
        var disabled = currentRow.id !== undefined
        this.$Modal.confirm({
          title: disabled ? '修改用户' : '新建用户',
          render: (h, params) => {
            return h('span', [
              h('p', '真实姓名:'),
              h('Input', {
                props: {
                  placeholder: '输入真实姓名',
                  value: this.currentUserData.realName,
                  clearable: true,
                },
                on: {
                  'on-change': (event) => {
                    this.currentUserData.realName = event.target.value
                  }
                }
              }),
              h('p', '用户名:'),
              h('Input', {
                props: {
                  placeholder: '输入用户名',
                  value: this.currentUserData.userName,
                  clearable: true,
                },
                on: {
                  'on-change': (event) => {
                    this.currentUserData.userName = event.target.value
                  }
                }
              }),
              h('p', '密码:'),
              h('Input', {
                props: {
                  placeholder: '输入密码',
                  value: disabled ? '' : this.currentUserData.password,
                  type: 'password',
                  clearable: true,
                  disabled: disabled
                },
                on: {
                  'on-change': (event) => {
                    this.currentUserData.password = event.target.value
                  }
                }
              }),
              h('p', '部门:'),
              h('Input', {
                props: {
                  placeholder: '输入部门',
                  value: this.currentUserData.department,
                  clearable: true,
                },
                on: {
                  'on-change': (event) => {
                    this.currentUserData.department = event.target.value
                  }
                }
              }),
              h('p', '邮箱:'),
              h('Input', {
                props: {
                  placeholder: '输入邮箱',
                  value: this.currentUserData.mail,
                  clearable: true,
                },
                on: {
                  'on-change': (event) => {
                    this.currentUserData.mail = event.target.value
                  }
                }
              }),
              h('p', '手机号码:'),
              h('Input', {
                props: {
                  placeholder: '输入手机号码',
                  value: this.currentUserData.phone,
                  clearable: true,
                },
                on: {
                  'on-change': (event) => {
                    this.currentUserData.phone = event.target.value
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
        createOrUpdateUser(this.currentUserData).then(res => {
          this.getUserData({page: this.currentUserPage - 1, count: this.countPerPage})
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
