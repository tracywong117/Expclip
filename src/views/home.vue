<template>
  <div>
    <!-- <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
    </el-breadcrumb> -->
    <div style="display: flex; justify-content: center;">
      <div class="home-page-container" style="width: 75%;">
        <el-upload drag class="upload-box">
          <div class="el-upload__text">
            Drop My Clipping.txt here or <em>click to upload</em>
          </div>
        </el-upload>
      </div>
    </div>
  </div>
  <div style="overflow-x: hidden; display: flex; justify-content: center;">
    <el-row :gutter="100" style="display: flex; justify-content: center; width: 100%;">
      <el-col :xs="20" :sm="10"  style="display: flex; padding-top: 30px;">
        <div class="green-light-box">
          <p class="normal-text">
            The books you have READ ...
          </p>
          <p class="big-text">
            20
          </p>
        </div>
      </el-col>
      <el-col :xs="20" :sm="10" style="display: flex; padding-top: 30px;">
        <div class="green-light-box">
          <p class="normal-text">
            The quotes you have MADE ...
          </p>
          <p class="big-text">
            100
          </p>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ElBreadcrumb, ElBreadcrumbItem, ElUpload, ElCol, ElRow,  } from 'element-plus';
export default {
  components: {
    ElBreadcrumb,
    ElBreadcrumbItem,
    ElUpload,
    ElCol,
    ElRow,
  },
  data() {
    return {

    }
  }
}

</script>

<style>

.upload-box {
  /* display: flex; */
  padding-top: 2rem;
  /* width: 400px; */
  /* height: 400px; */
}

.green-light-box {
  width: 250px;
  height: 250px;
  
  padding: 50px;
  background-color: var(--el-color-primary-light-9);
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.normal-text {
  font-size: 0.9rem;
}

.big-text {
  font-size: 4rem;
  line-height: 2rem;
}
</style>