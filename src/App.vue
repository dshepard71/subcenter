<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Fryeburg Academy Sub Center</h1>
    </header>
    <div class="app-content">
      <aside class="app-sidebar">
        <nav>
          <button @click="goTo('/')">Home</button><br />
          <button @click="goTo('/admin')">Admin</button>
          <button @click="goTo('/sub-coordinator')">Sub Coordinator</button>
          <button @click="goTo('/payroll')">Payroll</button>
          <!-- Tech Support Backdoor (barely visible now) -->
          <button class="tech-support-button" @click="showBackdoorLogin">
            Tech Support
          </button>
        </nav>
        <!-- Tech Support Login Modal -->
        <div v-if="showBackdoorModal" class="modal">
          <div class="modal-content">
            <span class="close" @click="closeBackdoorLogin">×</span>
            <h2 class="modal-title">Please Enter Password</h2>
            <label for="backdoorPassword">Password:</label>
            <input
              type="password"
              id="backdoorPassword"
              v-model="backdoorPassword"
            />
            <button @click="checkBackdoorPassword">Login</button>
            <div v-if="backdoorLoginError" class="error-message">
              Incorrect password.
            </div>
          </div>
        </div>

        <!-- NEW: Protected Routes Password Modal -->
        <div v-if="showProtectedModal" class="modal">
          <div class="modal-content">
            <span class="close" @click="closeProtectedModal">×</span>
            <h2 class="modal-title">Please Enter Password</h2>
            <label for="protectedEmailInput">Email:</label>
            <input
              type="email"
              id="protectedEmailInput"
              v-model="protectedEmailInput"
            />
            <label for="protectedPasswordInput">Password:</label>
            <input
              type="password"
              id="protectedPasswordInput"
              v-model="protectedPasswordInput"
            />
            <button @click="checkProtectedPassword">Login</button>
            <div v-if="loginError" class="error-message">
              Incorrect password or role.
            </div>
          </div>
        </div>
      </aside>
      <main class="app-main">
        <div v-if="$route.path === '/'" class="main-content">
          <div class="button-grid">
            <div class="menu-section teacher-menu">
              <h2>Teacher Menu</h2>
              <p>
                Please complete Teacher Absence Form before Substitute Plan
                Upload
              </p>
              <div class="button-container">
                <button
                  class="main-page-button"
                  @click="goTo('/teacher-absence-form')"
                >
                  <img src="/images/Need a sub.jpg" alt="Teacher Absence Form" />
                  <span>Teacher Absence Form</span>
                </button>
                <button
                  class="main-page-button"
                  @click="goTo('/personal-day-off-request')"
                >
                  <img
                    src="/images/Personal Day Off Image.jpg"
                    alt="Personal Day Off Request Form"
                  />
                  <span>Personal Day Off Request Form</span>
                </button>
                <button
                  class="main-page-button"
                  @click="goTo('/substitute-plan-upload')"
                >
                  <img src="/images/Lesson Plan.jpg" alt="Substitute Plan Upload" />
                  <span>Substitute Plan Upload</span>
                </button>
              </div>
            </div>
            <hr class="section-break" />
            <div class="menu-section substitute-menu">
              <h2>Substitute Menu</h2>
              <div class="button-container">
                <button
                  class="main-page-button"
                  @click="goTo('/substitute-assignments')"
                >
                  <img
                    src="/images/Sub Assignment.png"
                    alt="Substitute Assignments Available"
                  />
                  <span>Substitute Assignments Available</span>
                </button>
                <button
                  class="main-page-button"
                  @click="goTo('/check-my-schedule')"
                >
                  <img
                    src="/images/check my schedule.gif"
                    alt="Check My Schedule"
                  />
                  <span>Check My Schedule</span>
                </button>
                <button
                  class="main-page-button"
                  @click="goTo('/daily-bell-schedule')"
                >
                  <img
                    src="/images/Bell Schedule.jpg"
                    alt="Daily Bell Schedule"
                  />
                  <span>Daily Bell Schedule</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      showBackdoorModal: false,
      backdoorPassword: "",
      backdoorLoginError: false,
      showProtectedModal: false,
      protectedPasswordInput: "",
      protectedEmailInput: "",
      attemptedRoute: "",
      loginError: false,
      isTechSupportLoggedIn: false, // Global flag for tech support
      routeRoleMap: {
        "/admin": "admin",
        "/sub-coordinator": "subCoordinator",
        "/payroll": "payroll",
      },
    };
  },
  methods: {
    async goTo(path) {
      // Check if the route is one of the protected ones
      if (
        this.isTechSupportLoggedIn ||
        !["/admin", "/sub-coordinator", "/payroll"].includes(path)
      ) {
        // If tech support is logged in, bypass password check
        this.$router.push(path);
        return;
      }
      // Check if the route is one of the protected ones
      if (["/admin", "/sub-coordinator", "/payroll"].includes(path)) {
        // Show modal for password verification
        this.attemptedRoute = path;
        this.showProtectedModal = true;
      } else {
        this.$router.push(path);
      }
    },
    showBackdoorLogin() {
      this.showBackdoorModal = true;
    },
    closeBackdoorLogin() {
      this.showBackdoorModal = false;
      this.backdoorPassword = "";
      this.backdoorLoginError = false;
    },
    checkBackdoorPassword() {
      if (this.backdoorPassword === "cceagles89") {
        console.log("Tech Support Logged in!");
        alert("Tech Support Logged in!");
        this.isTechSupportLoggedIn = true; // Set the flag
        this.closeBackdoorLogin();
      } else {
        this.backdoorLoginError = true;
      }
    },
    closeProtectedModal() {
      this.showProtectedModal = false;
      this.protectedPasswordInput = "";
      this.protectedEmailInput = "";
      this.attemptedRoute = "";
      this.loginError = false; // Reset error state
    },
    async checkProtectedPassword() {
      this.loginError = false; // Reset error state
      const role = this.routeRoleMap[this.attemptedRoute];
      if (!role) {
        console.error(`No role mapping found for route: ${this.attemptedRoute}`);
        this.loginError = true;
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:4000/check-user-password",
          {
            role: role.replace(/-/g, ""),
            password: this.protectedPasswordInput,
            email: this.protectedEmailInput,
          }
        );

        if (response.data.success) {
          this.$router.push(this.attemptedRoute);
          this.closeProtectedModal();
        } else {
          this.loginError = true;
        }
      } catch (error) {
        console.error("Error during protected password check:", error);
        this.loginError = true;
      }
    },
  },
};
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-header {
  background-color: #2c3e50;
  color: #fff;
  padding: 20px;
  text-align: center;
}

.app-content {
  display: flex;
  flex: 1;
}

.app-sidebar {
  width: 150px;
  background-color: #34495e;
  padding: 20px;
  display: flex;
  flex-direction: column;
  color: #fff;
}

.app-sidebar button {
  margin-bottom: 10px;
  padding: 12px 15px;
  cursor: pointer;
  background-color: #4a6583;
  border: none;
  color: #fff;
  transition: background-color 0.3s ease;
}

.app-sidebar button:hover {
  background-color: #718ea3;
}

.tech-support-button {
  opacity: 0.3;
  font-size: 0.8rem;
  margin-top: 20px;
  background-color: transparent;
  border: none;
  color: #fff;
}

.tech-support-button:hover {
  opacity: 0.7;
  background-color: transparent;
}

.app-main {
  flex: 1;
  padding: 20px;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-content {
  text-align: center;
  max-width: 100%;
}

.button-grid {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 20px;
}

.menu-section {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.menu-section h2 {
  margin-bottom: 10px;
}

.menu-section p {
  margin-bottom: 20px;
  font-style: italic;
}

.button-container {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.button-container button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  background-color: #fff;
  padding: 15px 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-align: center;
  width: 250px;
  border-radius: 5px;
}

.button-container button:hover {
  background-color: #f0f0f0;
}

.button-container button img {
  max-width: 150px;
  max-height: 150px;
  margin-bottom: 5px;
}

.button-container button span {
  display: block;
  margin-top: 5px;
  white-space: nowrap;
}

.section-break {
  width: 80%;
  border: 0;
  border-top: 1px solid #ccc;
  margin: 20px auto;
}

/* Modal Styles */
.modal {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fefefe;
  padding: 20px;
  border: 1px solid #888;
  width: 50%;
  text-align: center;
}
.modal-title {
  color: black;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
.error-message {
  color: red;
}
</style>