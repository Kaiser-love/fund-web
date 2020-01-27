<template>
  <div class="user-avator-dropdown">
     <span style="vertical-align:middle;display:inline-block;"><Avatar
       :src="avatarUrl"/></span>
    <span style="vertical-align:middle;display:inline-block;margin-left: 20px">{{userName}}</span>
    <Dropdown @on-click="handleClick" style="margin-left: 20px">
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
        <DropdownItem name="changeAvatarUrl">修改头像</DropdownItem>
        <DropdownItem name="changePsw">修改密码</DropdownItem>
        <DropdownItem name="logout">退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <Modal
      v-model="isShowChangePsw"
      title="修改密码"
      @on-ok="onChangePsw">
        <span>
          <p>输入新密码：</p>
          <Input type="text" v-model="newPsw"/>
          <p>再次输入新密码：</p>
          <Input type="text" v-model="newPswTwice"/>
        </span>
    </Modal>
    <Modal
      v-model="isShowChangeAvatar"
      title="修改头像"
      @on-ok="onChangeAvatar">
        <span>
          <p>输入头像Url：</p>
          <Input type="text" v-model="newAvatar"/>
        </span>
    </Modal>
  </div>
</template>

<script>
  import './user.less'
  import {mapActions} from 'vuex'
  import {changePsw} from '../../../../api/user'
  import {createOrUpdateUser} from '../../../../api/user'
  import store from '@/store'

  export default {
    name: 'User',
    data() {
      return {
        isShowChangePsw: false,
        isShowChangeAvatar: false,
        newPsw: '',
        newAvatar: '',
        newPswTwice: ''
      }
    },
    computed: {},
    props: {
      userName: {
        type: String,
        default: ''
      },
      avatarUrl: {
        type: String,
        default: ''
      }
    },
    methods: {
      ...mapActions([
        'handleLogOut'
      ]),
      onChangePsw() {
        if (this.newPsw === this.newPswTwice) {
          let data = {newPassword: this.newPsw}
          changePsw(data).then(res => {
            this.$Message.info('修改密码成功')
            this.logout()
          })
        } else {
          this.$Message.error('两次输入的密码不一致')
        }
      },
      changePsw() {
        this.isShowChangePsw = true
      },
      changeAvatarUrl() {
        this.isShowChangeAvatar = true
      },
      onChangeAvatar() {
        createOrUpdateUser({
          "id": store.getters.userId,
          "avatarUrl": this.newAvatar
        }).then(res => {
          store.dispatch('getUserInfo').then(res => {
              this.avatarUrl = this.newAvatar
              this.$message.success("修改头像成功")
            }
          )
        })
      },
      logout() {
        this.handleLogOut().then(() => {
          this.$router.push({
            name: 'login'
          })
        })
      },
      message() {
        this.$router.push({
          name: 'message_page'
        })
      },
      handleClick(name) {
        switch (name) {
          case 'logout':
            this.logout()
            break
          case 'changePsw':
            this.changePsw()
            break
            break
          case 'changeAvatarUrl':
            this.changeAvatarUrl()
            break
        }
      }
    }
  }
</script>
