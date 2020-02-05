<style scoped>
  .expand-row {
    padding: 0 0 6px 0;
  }
</style>
<template>
  <div>
    <Row class="expand-row">
      <Col span="8" style="margin-top: 6px">
        <span style="margin-left:4px" class="expand-key">大小: </span>
        <span class="expand-value">{{ row.size }}</span>
      </Col>
      <Row class="expand-row">
        <Col span="8" style="margin-top: 6px">
          <span style="margin-left:4px" class="expand-key">评分： </span>
          <span class="expand-value">{{ row.score }}</span>
        </Col>
        <Col span="8" style="margin-top: 6px">
          <span style="margin-left:4px" class="expand-key">下载量：</span>
          <span class="expand-value">{{ row.downloadNumber }}</span>
        </Col>
        <Col span="16" style="margin-top: 6px">
          <span style="margin-left:4px" class="expand-key">图标Url： </span>
          <span class="expand-value"><a :href="row.iconUrl" target="_blank">查看APK图标</a></span>
        </Col>
        <Col span="8" style="margin-top: 6px">
          <span style="margin-left:4px" class="expand-key">Apk下载Url： </span>
          <span class="expand-value"><a :href="row.apkUrl" target="_blank">下载APK</a></span>
        </Col>
      </Row>
    </Row>
    <!-- <Row>
        <Col span="8">
            <span style="margin-left:4px" class="expand-key">总重量： </span>
            <span class="expand-value">{{ row.totalWeight==null?0:row.totalWeight }}</span>
        </Col>
        <Col span="8">
            <span style="margin-left:4px" class="expand-key">商品个数：</span>
            <span class="expand-value">{{ row.goodNumber==null?0:row.goodNumber }}</span>
        </Col>
        <Col span="8">
            <span style="margin-left:4px" class="expand-key">电子称电量： </span>
            <span class="expand-value">{{ row.measurePower==null?0:row.measurePower }}</span>
        </Col>
    </Row> -->
  </div>
</template>
<script>
  export default {
    name: 'apkExpand',
    props: {
      row: Object
    },
    methods: {}
  }
</script>
