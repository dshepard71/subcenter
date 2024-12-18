<template>
    <div class="upload-container">
      <h2>Setup Upload and View Data</h2>
      <!-- Platform Management Section -->
      <div class="upload-section">
        <h3>
          <button @click="showPlatformManagement = !showPlatformManagement">
            {{ showPlatformManagement ? "Hide" : "Show" }} Platform Management
          </button>
        </h3>
        <div v-if="showPlatformManagement" class="add-form">
          <h4>Sub Coordinator</h4>
          <input
            type="email"
            v-model="newPlatformUser['sub-coordinator'].email"
            placeholder="Email"
          />
          <input
            type="text"
            v-model="newPlatformUser['sub-coordinator'].first_name"
            placeholder="First Name"
          />
          <input
            type="text"
            v-model="newPlatformUser['sub-coordinator'].last_name"
            placeholder="Last Name"
          />
          <button @click="addPlatformUser('sub-coordinator')">
            Add Sub Coordinator
          </button>
          <h4>Payroll</h4>
          <input
            type="email"
            v-model="newPlatformUser.payroll.email"
            placeholder="Email"
          />
          <input
            type="text"
            v-model="newPlatformUser.payroll.first_name"
            placeholder="First Name"
          />
          <input
            type="text"
            v-model="newPlatformUser.payroll.last_name"
            placeholder="Last Name"
          />
          <button @click="addPlatformUser('payroll')">Add Payroll User</button>
          <h4>Personal Day Approver 1</h4>
          <input
            type="email"
            v-model="newPlatformUser.approver1.email"
            placeholder="Email"
          />
          <input
            type="text"
            v-model="newPlatformUser.approver1.first_name"
            placeholder="First Name"
          />
          <input
            type="text"
            v-model="newPlatformUser.approver1.last_name"
            placeholder="Last Name"
          />
          <button @click="addPlatformUser('approver1')">
            Add Approver 1
          </button>
          <h4>Personal Day Approver 2</h4>
          <input
            type="email"
            v-model="newPlatformUser.approver2.email"
            placeholder="Email"
          />
          <input
            type="text"
            v-model="newPlatformUser.approver2.first_name"
            placeholder="First Name"
          />
          <input
            type="text"
            v-model="newPlatformUser.approver2.last_name"
            placeholder="Last Name"
          />
          <button @click="addPlatformUser('approver2')">
            Add Approver 2
          </button>
          <h4>Admin</h4>
          <input
            type="email"
            v-model="newPlatformUser.admin.email"
            placeholder="Email"
          />
          <input
            type="text"
            v-model="newPlatformUser.admin.first_name"
            placeholder="First Name"
          />
          <input
            type="text"
            v-model="newPlatformUser.admin.last_name"
            placeholder="Last Name"
          />
          <button @click="addPlatformUser('admin')">Add Admin</button>
        </div>
        <button @click="toggleView('users')">
          {{ show.users ? "Hide" : "View" }} Platform Users
        </button>
        <table v-if="show.users" class="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Name</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data.users" :key="item.id">
              <td>{{ item.email }}</td>
              <td>{{ item.first_name }}</td>
              <td>{{ item.last_name }}</td>
              <td>{{ item.full_name }}</td>
              <td>{{ item.role }}</td>
              <td>
                <button @click="deleteRecord('/users', item.id, 'users')">
                  Delete
                </button>
                <button @click="showResetPasswordForm(item.email)">
                  Reset Password
                </button>
                <div v-if="passwordReset.email === item.email" class="add-form">
                  <input
                    type="password"
                    v-model="passwordReset.newPassword"
                    placeholder="New Password"
                  />
                  <button @click="resetPassword(item.email)">Confirm</button>
                  <button @click="passwordReset.email = ''">Cancel</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Teachers Upload -->
      <div class="upload-section">
        <h3>Upload Teachers</h3>
        <form @submit.prevent="uploadFile('/upload-teachers', 'teachers')">
          <input type="file" @change="handleFileChange" accept=".csv" />
          <button type="submit">Upload Teachers</button>
        </form>
        <button @click="toggleView('teachers')">
          {{ show.teachers ? "Hide" : "View" }} Teachers
        </button>
        <button @click="clearTable('/teachers', 'teachers')">
          Clear Teachers
        </button>
        <div v-if="show.teachers" class="add-form">
          <h3>Add New Teacher</h3>
          <input type="email" v-model="newTeacher.email" placeholder="Email" />
          <input
            type="text"
            v-model="newTeacher.first_name"
            placeholder="First Name"
          />
          <input
            type="text"
            v-model="newTeacher.last_name"
            placeholder="Last Name"
          />
          <button @click="addRecord('/teachers', 'teachers')">
            Add Teacher
          </button>
        </div>
        <table v-if="show.teachers" class="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data.teachers" :key="item.id">
              <td>{{ item.email }}</td>
              <td>{{ item.first_name }}</td>
              <td>{{ item.last_name }}</td>
              <td>{{ item.full_name }}</td>
              <td>
                <button @click="deleteRecord('/teachers', item.id, 'teachers')">
                  Delete
                </button>
                <button @click="showResetPasswordForm(item.email)">
                  Reset Password
                </button>
                <div v-if="passwordReset.email === item.email" class="add-form">
                  <input
                    type="password"
                    v-model="passwordReset.newPassword"
                    placeholder="New Password"
                  />
                  <button @click="resetPassword(item.email)">Confirm</button>
                  <button @click="passwordReset.email = ''">Cancel</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Schedules Upload -->
      <div class="upload-section">
        <h3>Upload Teacher Schedules</h3>
        <form @submit.prevent="uploadFile('/upload-schedules', 'schedules')">
          <input type="file" @change="handleFileChange" accept=".csv" />
          <button type="submit">Upload Schedules</button>
        </form>
        <button @click="toggleView('schedules')">
          {{ show.schedules ? "Hide" : "View" }} Schedules
        </button>
        <button @click="clearTable('/schedules', 'schedules')">
          Clear Schedules
        </button>
        <table v-if="show.schedules" class="data-table">
          <thead>
            <tr>
              <th>Day Label</th>
              <th>Teacher Name</th>
              <th>Course</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data.schedules" :key="item.id">
              <td>{{ item.day_label }}</td>
              <td>{{ item.teacher_name }}</td>
              <td>{{ item.course_name }}</td>
              <td>{{ item.location }}</td>
              <td>
                <button @click="deleteRecord('/schedules', item.id, 'schedules')">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Substitutes Upload -->
      <div class="upload-section">
        <h3>Upload Substitutes</h3>
        <form @submit.prevent="uploadFile('/upload-substitutes', 'substitutes')">
          <input type="file" @change="handleFileChange" accept=".csv" />
          <button type="submit">Upload Substitutes</button>
        </form>
        <button @click="toggleView('substitutes')">
          {{ show.substitutes ? "Hide" : "View" }} Substitutes
        </button>
        <button @click="clearTable('/users', 'substitutes')">
          Clear Substitutes
        </button>
        <div v-if="show.substitutes" class="add-form">
          <h3>Add New Substitute</h3>
          <input type="email" v-model="newSubstitute.email1" placeholder="Email 1" />
          <input type="email" v-model="newSubstitute.email2" placeholder="Email 2" />
          <input
            type="text"
            v-model="newSubstitute.first_name"
            placeholder="First Name"
          />
          <input
            type="text"
            v-model="newSubstitute.last_name"
            placeholder="Last Name"
          />
          <input
            type="text"
            v-model="newSubstitute.phone"
            placeholder="Phone Number"
          />
          <input type="text" v-model="newSubstitute.role" placeholder="Role" />
          <button @click="addRecord('/users', 'substitutes')">
            Add Substitute
          </button>
        </div>
        <table v-if="show.substitutes" class="data-table">
          <thead>
            <tr>
              <th>Email1</th>
              <th>Email2</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data.substitutes" :key="item.id">
              <td>{{ item.email1 }}</td>
              <td>{{ item.email2 }}</td>
              <td>{{ item.first_name }}</td>
              <td>{{ item.last_name }}</td>
              <td>{{ item.full_name }}</td>
              <td>{{ item.phone }}</td>
              <td>{{ item.role }}</td>
              <td>
                <button @click="deleteRecord('/users', item.id, 'substitutes')">
                  Delete
                </button>
                <button @click="showResetPasswordForm(item.email)">
                  Reset Password
                </button>
                <div v-if="passwordReset.email === item.email" class="add-form">
                  <input
                    type="password"
                    v-model="passwordReset.newPassword"
                    placeholder="New Password"
                  />
                  <button @click="resetPassword(item.email)">Confirm</button>
                  <button @click="passwordReset.email = ''">Cancel</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pay End Dates Upload -->
      <div class="upload-section">
        <h3>Upload Pay End Dates</h3>
        <form
          @submit.prevent="uploadFile('/upload-pay-end-dates', 'payEndDates')"
        >
          <input type="file" @change="handleFileChange" accept=".csv" />
          <button type="submit">Upload Pay End Dates</button>
        </form>
        <button @click="toggleView('payEndDates')">
          {{ show.payEndDates ? "Hide" : "View" }} Pay End Dates
        </button>
        <button @click="clearTable('/payEndDates', 'payEndDates')">
          Clear Pay End Dates
        </button>
        <div v-if="show.payEndDates" class="add-form">
          <h3>Add New Pay End Date</h3>
          <input
            type="date"
            v-model="newPayEndDate.pay_end_date"
            placeholder="Pay End Date (MM/DD/YYYY)"
          />
          <button @click="addRecord('/pay-end-dates', 'payEndDates')">
            Add Pay End Date
          </button>
        </div>
        <table v-if="show.payEndDates" class="data-table">
          <thead>
            <tr>
              <th>Pay End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data.payEndDates" :key="item.id">
              <td>{{ item.pay_end_date }}</td>
              <td>
                <button
                  @click="deleteRecord('/payEndDates', item.id, 'payEndDates')"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Days of School Upload -->
      <div class="upload-section">
        <h3>Upload Days of School</h3>
        <form
          @submit.prevent="uploadFile('/upload-days-of-school', 'daysOfSchool')"
        >
          <input type="file" @change="handleFileChange" accept=".csv" />
          <button type="submit">Upload Days of School</button>
        </form>
        <button @click="toggleView('daysOfSchool')">
          {{ show.daysOfSchool ? "Hide" : "View" }} Days of School
        </button>
        <button @click="clearTable('/daysOfSchool', 'daysOfSchool')">
          Clear Days of School
        </button>
        <div v-if="show.daysOfSchool" class="add-form">
          <h3>Add New Day of School</h3>
          <input
            type="text"
            v-model="newDayOfSchool.schedule_name"
            placeholder="Schedule Name"
          />
          <input
            type="text"
            v-model="newDayOfSchool.school_year"
            placeholder="School Year"
          />
          <input
            type="date"
            v-model="newDayOfSchool.calendar_date"
            placeholder="Calendar Date (MM/DD/YYYY)"
          />
          <button @click="addRecord('/days-of-school', 'daysOfSchool')">
            Add Day of School
          </button>
        </div>
        <table v-if="show.daysOfSchool" class="data-table">
          <thead>
            <tr>
              <th>Schedule Name</th>
              <th>School Year</th>
              <th>Calendar Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data.daysOfSchool" :key="item.id">
              <td>{{ item.schedule_name }}</td>
              <td>{{ item.school_year }}</td>
              <td>{{ item.calendar_date }}</td>
              <td>
                <button
                  @click="deleteRecord('/daysOfSchool', item.id, 'daysOfSchool')"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  import moment from "moment";
  export default {
    data() {
      return {
        file: null,
        data: {
          teachers: [],
          schedules: [],
          substitutes: [],
          payEndDates: [],
          daysOfSchool: [],
          users: [],
        },
        newTeacher: {
          email: "",
          first_name: "",
          last_name: "",
        },
        newSubstitute: {
          email1: "",
          email2: "",
          first_name: "",
          last_name: "",
          phone: "",
          role: "",
        },
        newPayEndDate: {
          pay_end_date: "",
        },
        newDayOfSchool: {
          schedule_name: "",
          school_year: "",
          calendar_date: "",
        },
        newPlatformUser: {
          "sub-coordinator": {
            email: "",
            first_name: "",
            last_name: "",
          },
          payroll: {
            email: "",
            first_name: "",
            last_name: "",
          },
          approver1: {
            email: "",
            first_name: "",
            last_name: "",
          },
          approver2: {
            email: "",
            first_name: "",
            last_name: "",
          },
          admin: {
            email: "",
            first_name: "",
            last_name: "",
          },
        },
        passwordReset: {
          email: "",
          newPassword: "",
        },
        show: {
          teachers: false,
          schedules: false,
          substitutes: false,
          payEndDates: false,
          daysOfSchool: false,
          users: false,
        },
        showPlatformManagement: false,
      };
    },
    methods: {
      handleFileChange(event) {
        this.file = event.target.files[0];
      },
      async uploadFile(endpoint, type) {
        if (!this.file) return alert("Please select a file.");
        const formData = new FormData();
        formData.append("file", this.file);
        console.log(formData);
        try {
          await axios.post(`http://localhost:4000${endpoint}`, formData);
          this.fetchData(type);
        } catch (error) {
          console.error(
            "Error uploading file:",
            error.response?.data || error.message
          );
          if (error.response?.data?.errors) {
            console.error("CSV Errors:", error.response.data.errors);
            alert(
              `Upload failed: ${
                error.response?.data?.message
              }. \nSee console for details.`
            );
          } else {
            alert(
              `Upload failed: ${
                error.response?.data?.message || "See console for details."
              }`
            );
          }
        } finally {
          this.file = null;
        }
      },
      toggleView(type) {
        this.show[type] = !this.show[type];
        if (this.show[type]) this.fetchData(type);
      },
      async fetchData(type) {
      try {
        const response = await axios.get(`http://localhost:4000/${type}`);
        if (type === 'teachers') {
          this.data[type] = response.data.map(item => ({
            ...item,
            full_name: `${item.last_name}, ${item.first_name}`
          }));
       } else if (type === 'users') {
          // Fetch platform users (excluding substitutes)
          this.data[type] = response.data
            .filter(user => user.role !== 'substitute')
            .map(item => ({
              ...item,
              full_name: `${item.last_name}, ${item.first_name}`
            }));
        } else if (type === 'substitutes') {
          // Fetch all users and then filter
          const usersResponse = await axios.get(`http://localhost:4000/users`);
          this.data.substitutes = usersResponse.data
            .filter(user => user.role.includes('substitute'))
            .map(item => ({
              ...item,
              full_name: `${item.last_name}, ${item.first_name}`
            }));
        } else {
          this.data[type] = response.data;
        }
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        alert(`Error fetching ${type}: ${error.message}`);
      }
    },
      async clearTable(endpoint, type) {
        try {
          await axios.delete(`http://localhost:4000${endpoint}`);
          this.fetchData(type);
        } catch (error) {
          console.error(`Error clearing ${type}:`, error);
          alert(`Error clearing ${type}: ${error.message}`);
        }
      },
      async deleteRecord(endpoint, id, type) {
        try {
          await axios.delete(`http://localhost:4000${endpoint}/${id}`);
          this.fetchData(type);
        } catch (error) {
          console.error(`Error deleting ${type}:`, error);
          alert(`Error deleting ${type}: ${error.message}`);
        }
      },
      async addRecord(endpoint, type) {
        let newRecord = {};
        if (type === "teachers") {
          newRecord = {
            ...this.newTeacher,
          };
        } else if (type === "substitutes") {
          newRecord = {
            ...this.newSubstitute,
            role: "substitute",
          };
        } else if (type === "payEndDates") {
          newRecord = {
            pay_end_date: moment(this.newPayEndDate.pay_end_date).format(
              "YYYY-MM-DD"
            ),
          };
        } else if (type === "daysOfSchool") {
          newRecord = {
            ...this.newDayOfSchool,
            calendar_date: moment(this.newDayOfSchool.calendar_date).format(
              "YYYY-MM-DD"
            ),
          };
        }
        try {
          await axios.post(`http://localhost:4000${endpoint}`, newRecord);
          this.fetchData(type);
          if (type === "teachers") {
            this.newTeacher = { email: "", first_name: "", last_name: "" };
          } else if (type === "substitutes") {
            this.newSubstitute = {
              email1: "",
              email2: "",
              first_name: "",
              last_name: "",
              phone: "",
              role: "",
            };
          } else if (type === "payEndDates") {
            this.newPayEndDate = { pay_end_date: "" };
          } else if (type === "daysOfSchool") {
            this.newDayOfSchool = {
              schedule_name: "",
              school_year: "",
              calendar_date: "",
            };
          }
        } catch (error) {
          console.error(`Error adding ${type}:`, error);
          alert(`Error adding ${type}: ${error.message}`);
        }
      },
      async addPlatformUser(role) {
        try {
          const newPlatformUser = this.newPlatformUser[role];
          console.log("Adding platform user:", role, newPlatformUser);
  
          await axios.post(
            `http://localhost:4000/users`,
            { ...newPlatformUser, role: role },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          alert(`${role} added successfully.`);
          this.fetchData("users");
        } catch (error) {
          console.error(`Error adding ${role}:`, error);
          alert(
            `Error adding ${role}: ${
              error.response?.data?.error || error.message
            }`
          );
        }
        this.newPlatformUser[role] = { email: "", first_name: "", last_name: "" };
      },
      showResetPasswordForm(email) {
        // Populate the passwordReset object, triggering the display of the form
        this.passwordReset.email = email;
      },
      async resetPassword(email) {
        try {
          await axios.post("http://localhost:4000/reset-password", {
            email,
            newPassword: this.passwordReset.newPassword,
          });
          alert("Password reset successfully");
          this.passwordReset = { email: "", newPassword: "" }; // Clear the form
        } catch (error) {
          console.error(`Error resetting password:`, error);
          alert(
            `Error resetting password: ${
              error.response?.data?.error || error.message
            }`
          );
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .upload-container {
    margin: 20px;
    text-align: center;
  }
  
  .upload-section {
    margin-bottom: 20px;
  }
  
  input,
  button {
    margin: 10px;
    padding: 8px;
  }
  .add-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 10px;
  }
  .add-form input {
    margin: 5px 0;
    padding: 8px;
    width: 250px;
  }
  .data-table {
    width: 80%;
    margin: auto;
    border-collapse: collapse;
  }
  
  .data-table th,
  .data-table td {
    border: 1px solid #ddd;
    padding: 8px;
  }
  </style>