<template>
  <div>
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="home-page-container">
      <el-upload drag class="upload-box">
        <div class="el-upload__text">
          Drop My Clipping.txt here or <em>click to upload</em>
        </div>
      </el-upload>
    </div>
  </div>
</template>

<script>
import { ElBreadcrumb, ElBreadcrumbItem, ElUpload } from 'element-plus';
export default {
  components: {
    ElBreadcrumb,
    ElBreadcrumbItem,
    ElUpload,

  },
  data() {
    return {

    }
  }
}

</script>

<style>

/* .home-page-container {
  display: flex;
  justify-self: center;
  flex-direction: column;
} */

.upload-box{
  /* display: flex; */
  padding-top: 2rem;
  width: 400px;
  height: 400px;
}

</style>