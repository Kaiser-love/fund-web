<template>
  <div ref="container" style="display: flex;flex-direction: column;flex-wrap: wrap;justify-content: flex-start; ">
    <div style="display: flex;flex-direction: column;flex-wrap: wrap;justify-content: flex-start; ">
      <Card :bordered="false" v-bind:style="{ width: windowWidth + 'px' }">
        <div slot="title">
          <Row type="flex" justify="center" align="middle">
            <Col span="22">
              <Select v-model="ocrType" style="width:300px">
                <Option v-for="item in ocrTypeList" :value="item.code" :key="item.code"> {{ item.desc }}
                </Option>
              </Select>
            </Col>
            <Col span="2">
              <el-button type="primary" :icon="isImgShow ? 'el-icon-circle-close' : 'el-icon-circle-check'"
                         size="small" style="margin-left: 50px"
                         @click="hidePhoto">{{isImgShow?"隐藏图片":"显示图片"}}
              </el-button>
            </Col>
          </Row>
        </div>
        <Tabs :animated="false">
          <TabPane label="上传图片" v-show="ocrType!==''">
            <Upload style="margin-top:10px;"
                    multiple
                    :on-success="onUploadSucess"
                    :on-error="onUploadFail"
                    :show-upload-list="false"
                    :headers="headers"
                    type="drag"
                    :action="getUrl()+'/v1/ocr/recognize?ocrType='+ocrType">
              <div style="padding: 20px 0;">
                <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                <p>点击上传或者拖拽文件上传</p>
              </div>
            </Upload>
            <div style="margin-top:10px;">
              <img :src="imgUrl" v-show="isImgShow" class="image">
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
    <div style="display: flex;flex-direction: row;flex-wrap: wrap;justify-content: flex-start; margin-top: 30px">
      <Card :bordered="false" v-bind:style="{ width: windowWidth + 'px' }">
        <Tabs :animated="false">
          <TabPane label="OCR详细检测结果">
            <json-viewer :value="recognizeText" :expand-depth=50
                         copyable
                         boxed
                         sort></json-viewer>
          </TabPane>
          <TabPane label="OCR简单检测结果">
            <p v-html=text></p>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  </div>
</template>

<script>
  import super_table from '@/components/table/supertable.vue'
  import store from '@/store'
  import config from '@/config'
  import {getOcrTypes} from '../../api/metaApi'

  export default {
    components: {
      super_table
    },
    data() {
      return {
        imgUrl: '',
        isImgShow: true,
        recognizeText: {},
        text: '',
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
        ocrType: '',
        headers: {
          ESLS: store.getters.token
        },
        windowWidth: 0
      }
    },
    created() {
      getOcrTypes().then(res => {
        this.ocrTypeList = res.data.data
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
    computed: {},
    methods: {
      hidePhoto() {
        if (this.isImgShow) {
          if (this.imgUrl === '') {
            this.$message.warning('隐藏图片前请先上传图片哦');
            return;
          }
          this.isImgShow = false
          window.open(this.imgUrl, "_blank")
        } else {
          this.isImgShow = true
        }
      },
      getUrl() {
        return config.detectServiceUrl
      },
      onUploadSucess(response) {
        this.imgUrl = response.data.imgUrl
        this.recognizeText = response.data.recognizeResultTextObj
        this.text = response.data.text
        this.$message.success('图片上传成功');
      },
      onUploadFail() {
        this.imgUrl = ''
        this.recognizeText = {}
        this.text = ''
        this.$message.error("图片上传失败");
      }
    }
  }
</script>
<style>
  .image {
    width: 100%;
    display: block;
  }
</style>
