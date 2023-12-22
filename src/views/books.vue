<template>
  <div class="page-container">
    <el-breadcrumb :separator-icon="ArrowRight" style="font-size: 40px !important;">
      <el-breadcrumb-item :to="{ path: '/books' }">Books</el-breadcrumb-item>
    </el-breadcrumb>
    <div style="display: flex; justify-content: center;">
      <div class="home-page-container" style="width: 75%;">
        <!-- <el-upload drag class="upload-box" @change="readFile()" type="file" ref="doc" :multiple="false" :show-file-list="false">
          <div class="el-upload__text">
            Drop My Clipping.txt here or <em>click to upload</em>
          </div>
        </el-upload> -->
      </div>
    </div>
    <div class="center-container">
      <input type="file" ref="doc" @change="readFile()" />
      <el-button type="primary" @click="exportFile()"><svg-icon type="mdi" :path="export_svg_path"></svg-icon></el-button>
    </div>
    <div class="center-container">
      <el-table :data="jsonRecords" element-loading-text="Loading" style="
      width: 100%; 
      font-size: 18px; 
      color:rgb(70, 68, 81); 
      border-radius: 15px; 
      /* box-shadow: rgba(0, 0, 0, 0.09) 0px 3px 12px; */
      box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
      " :cell-style="{ padding: '20px 10px 20px 10px', }"
        :header-cell-style="{ background: 'rgb(249,249,251)', color: 'rgb(163,165,185)', padding: '10px 10px 10px 10px', }"
        fit lazy highlight-current-row>
        <el-table-column :prop="item.prop" :label="item.label" v-for="item in tableHeader" :key="item.prop" align="left">
          <template #default="scope">
            <div v-show="scope.row.Editable">
              <el-input v-model="scope.row[item.prop]" autosize type="textarea"
                :placeholder="`Please enter${item.label}`" />
            </div>

            <div v-show="!scope.row.Editable">
              {{ scope.row[item.prop] }}
            </div>

          </template>

        </el-table-column>
        <el-table-column label="Action" align="left" width="200">
          <template #default="scope">
            <el-button v-show="!scope.row.Editable" size="small" plain @click="scope.row.Editable = true">Edit</el-button>
            <el-button v-show="scope.row.Editable" size="small" type="success"
              @click="handleEdit(scope.$index, scope.row)">Confirm</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(scope.$index)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>

    </div>
  </div>
</template>

<script>
import { ElMenu, ElMenuItem, ElSubMenu, ElBreadcrumb, ElBreadcrumbItem, ElTable, ElTableColumn, ElButton, ElInput, ElUpload } from 'element-plus';
import Swal from "sweetalert2";
import FileSaver from "file-saver";
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiExportVariant } from '@mdi/js';

export default {
  components: {
    ElMenu,
    ElMenuItem,
    ElSubMenu,
    ElBreadcrumb,
    ElBreadcrumbItem,
    ElTable,
    ElTableColumn,
    ElButton,
    ElInput,
    SvgIcon,
    ElUpload,

  },
  data() {
    return {
      file: null,
      content: null,
      text_arr: null,
      jsonRecords: null,
      item: {
        "Book": '',
        "Author": '',
        //"Datetime" : '',
        "Quote": '',
      },
      tableHeader: [
        {
          prop: "Book",
          label: "Book Name",
          type: "input",
        },
        {
          prop: "Author",
          label: "Author Name",
          type: "input"
        },/*
        {
          prop: "Datetime",
          label: "Date",
          type: "input"
        },*/
        {
          prop: "Quote",
          label: "My Quote",
          type: "input"
        }
      ],
      export_svg_path: mdiExportVariant,
    }
  },
  methods: {
    readFile() {

      function getInfo(s) {
        let InfoLength = s.length;
        let author_index_1 = s.indexOf('\r\n') - 1;
        let author_index_0 = 0;
        let book_index_0 = 0;
        let book_index_1 = 0;
        let page_index_0 = s.indexOf('on page ') + 'on page '.length;
        let page_index_1 = 0;
        let location_index_0 = s.indexOf('| location ') + '| location '.length;
        let location_index_1 = 0;
        let week_index_0 = s.indexOf("| Added on ") + '| Added on '.length;
        let week_index_1 = 0;
        let datetime_index_0 = 0;
        let datetime_index_1 = 0;
        let quote_index_0 = 0;

        for (let i = author_index_1; i >= 0; i--) {
          if (s[i] == '(') {
            author_index_0 = i + 1;
            book_index_1 = i - 1;
            break;
          }
        }
        for (let i = page_index_0; i < InfoLength; i++) {
          if (s[i] == '|') {
            page_index_1 = i - 1;
            break;
          }
        }
        for (let i = location_index_0; i < InfoLength; i++) {
          if (s[i] == '|') {
            location_index_1 = i - 1;
            break;
          }
        }
        for (let i = week_index_0; i < InfoLength; i++) {
          if (s[i] == ',') {
            week_index_1 = i;
            datetime_index_0 = i + 2;
            break;
          }
        }
        for (let i = datetime_index_0; i < InfoLength; i++) {
          if (s[i] == ':') {
            datetime_index_1 = i + 6;
            quote_index_0 = i + 10;
            break;
          }
        }

        return [s.substring(book_index_0, book_index_1),
        s.substring(author_index_0, author_index_1),
        s.substring(page_index_0, page_index_1),
        s.substring(location_index_0, location_index_1),
        s.substring(week_index_0, week_index_1),
        s.substring(datetime_index_0, datetime_index_1),
        s.substring(quote_index_0,)];
      }

      this.file = this.$refs.doc.files[0];
      console.log(this.file);
      const reader = new FileReader();
      if (this.file.name.includes('My Clippings')) { // Only My Clipping.txt is accepted
        Swal.fire({
          title: 'Inputed.',
          icon: 'success'
        });
        reader.onload = (res) => {
          this.content = res.target.result.toString();
          let text = this.content;
          text += "\r\n";
          //text = text.replace(/(\r\n|\n|\r)/gm, "");
          this.text_arr = text.split("==========\r\n");
          var records = [];

          for (let i = 0; i < this.text_arr.length; i++) { // Loop through all entity in My Clipping.txt
            var record = {
              "index": i,
              "Book": getInfo(this.text_arr[i])[0],
              "Author": getInfo(this.text_arr[i])[1],
              "Page": getInfo(this.text_arr[i])[2],
              "Location": getInfo(this.text_arr[i])[3],
              "Week": getInfo(this.text_arr[i])[4],
              "Datetime": getInfo(this.text_arr[i])[5],
              "Quote": getInfo(this.text_arr[i])[6],
              "Editable": false
            };
            records.push(record);
          }
          records.pop();
          this.jsonRecords = JSON.parse(JSON.stringify(records));
          //console.log(this.jsonRecords);

        };
        reader.onerror = (err) => console.log(err);
        reader.readAsText(this.file);

      } else {
        this.content = "";
        Swal.fire({
          title: 'Please upload My Clippings.txt',
          icon: 'info'
        });
        reader.onload = (res) => {
          console.log(res.target.result);
        };
        reader.onerror = (err) => console.log(err);
        reader.readAsText(this.file);
      }
    }, handleDelete(index) {
      //console.log(index, row);
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'success',
          cancelButton: 'danger'
        },
        buttonsStyling: true
      })
      swalWithBootstrapButtons.fire({
        title: 'Do you want to delete?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete!',
        cancelButtonText: 'Cancel!',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          this.jsonRecords.splice(index, 1);
          swalWithBootstrapButtons.fire(
            'Deleted!',
            'The quote record has been deleted.',
            'success'
          )
        }
      })
    }, handleEdit(index, row) {
      //console.log(row);
      row.Editable = false;
      this.jsonRecords[index]["Book"] = row["Book"];
      this.jsonRecords[index]["Author"] = row["Author"];
      this.jsonRecords[index]["Quote"] = row["Quote"] + '\r\n';
      //console.log(this.jsonRecords);
    }, exportFile() {
      const savePath = "My Clippings.txt";
      // form the content of My Clipping.txt in string
      let str_temp = "";

      // Follow the structure to generate the My Clipping.txt file
      for (var i = 0; i < this.jsonRecords.length; i++) {
        str_temp += this.jsonRecords[i]["Book"];
        str_temp += ' (' + this.jsonRecords[i]["Author"];
        str_temp += ')\r\n- Your Highlight on page ' + this.jsonRecords[i]["Page"];
        str_temp += ' | location ' + this.jsonRecords[i]["Location"];
        str_temp += ' | Added on ' + this.jsonRecords[i]["Week"];
        str_temp += ', ' + this.jsonRecords[i]["Datetime"];
        str_temp += '\r\n\r\n' + this.jsonRecords[i]["Quote"];
        str_temp += ("==========\r\n");
      }
      // export txt file using FileSaver
      var blob = new Blob([str_temp], { type: "text/plain;charset=utf-8" });
      FileSaver.saveAs(blob, savePath);

    }
  }
}

</script>

<style>
.el-breadcrumb {
  font-size: 1.2rem;
}

.el-breadcrumb__item:last-child .el-breadcrumb__inner {
  color: var(--el-color-primary);
}

.page-container {
  padding: 15px;
}

/* .center-container {
  display: flex;
  justify-content: center;
} */
</style>