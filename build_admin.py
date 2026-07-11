import os

OUT = r'C:\Users\Shourya Awasthi\OneDrive\Desktop\intership\admin-dashboard.html'

parts = []

parts.append("""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>KRMU EDU - Admin Portal</title>
  <link rel="stylesheet" href="admin-dashboard.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
</head>
<body>
""")

parts.append("""  <aside class="sidebar" id="sidebar">
    <div class="sidebar-brand">
      <div class="brand-logo"><i class="fa-solid fa-graduation-cap"></i></div>
      <div class="brand-text">
        <span class="brand-name">KRMU<span>EDU</span></span>
        <span class="brand-role" id="sidebar-role">Admin</span>
      </div>
    </div>
    <nav class="sidebar-nav">
      <a href="#" class="nav-item active" data-page="dashboard" onclick="navigate(this)"><i class="fa-solid fa-chart-pie"></i><span>Dashboard</span></a>
      <div class="nav-section">MANAGEMENT</div>
      <a href="#" class="nav-item" data-page="students" onclick="navigate(this)"><i class="fa-solid fa-user-graduate"></i><span>Students</span></a>
      <a href="#" class="nav-item" data-page="mentors" onclick="navigate(this)"><i class="fa-solid fa-chalkboard-user"></i><span>Mentors</span></a>
      <a href="#" class="nav-item" data-page="internships" onclick="navigate(this)"><i class="fa-solid fa-briefcase"></i><span>Internships</span></a>
      <a href="#" class="nav-item" data-page="applications" onclick="navigate(this)"><i class="fa-solid fa-file-lines"></i><span>Applications</span></a>
      <div class="nav-section">OPERATIONS</div>
      <a href="#" class="nav-item" data-page="attendance" onclick="navigate(this)"><i class="fa-solid fa-calendar-check"></i><span>Attendance</span></a>
      <a href="#" class="nav-item" data-page="certificates" onclick="navigate(this)"><i class="fa-solid fa-certificate"></i><span>Certificates</span></a>
      <a href="#" class="nav-item" data-page="reports" onclick="navigate(this)"><i class="fa-solid fa-chart-bar"></i><span>Reports</span></a>
      <div class="nav-section">SYSTEM</div>
      <a href="#" class="nav-item" data-page="users" onclick="navigate(this)"><i class="fa-solid fa-users-gear"></i><span>User Management</span></a>
      <a href="#" class="nav-item" data-page="settings" onclick="navigate(this)"><i class="fa-solid fa-gear"></i><span>Settings</span></a>
    </nav>
    <button class="logout-btn" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i><span>Logout</span></button>
  </aside>
""")

parts.append("""  <div class="main-wrapper">
    <header class="topbar">
      <button class="hamburger" onclick="toggleSidebar()"><i class="fa-solid fa-bars"></i></button>
      <div class="search-box">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" placeholder="Search students, internships..." />
      </div>
      <div class="topbar-right">
        <button class="icon-btn" onclick="toggleTheme()"><i class="fa-regular fa-moon" id="theme-icon"></i></button>
        <button class="icon-btn notif-btn"><i class="fa-regular fa-bell"></i><span class="notif-badge">5</span></button>
        <div class="avatar-menu" onclick="toggleDropdown()">
          <div class="avatar admin-avatar" id="user-avatar">A</div>
          <div class="avatar-info">
            <span class="avatar-name" id="user-name">Admin</span>
            <i class="fa-solid fa-chevron-down" style="font-size:10px;color:#9ca3af;"></i>
          </div>
          <div class="dropdown-menu" id="dropdown">
            <a href="#"><i class="fa-solid fa-circle-user"></i> My Profile</a>
            <a href="#"><i class="fa-solid fa-gear"></i> Settings</a>
            <hr />
            <a href="#" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
          </div>
        </div>
      </div>
    </header>
    <main class="content">
""")

parts.append("""      <!-- DASHBOARD PAGE -->
      <div class="page active" id="page-dashboard">
        <div class="page-header">
          <div>
            <h2>Admin Dashboard</h2>
            <p class="page-subtitle">Welcome back, <span id="welcome-name">Admin</span>.</p>
          </div>
          <div class="header-actions">
            <button class="btn-outline-dark"><i class="fa-solid fa-download"></i> Export</button>
            <button class="btn-primary" onclick="navigate(document.querySelector('[data-page=internships]'))"><i class="fa-solid fa-plus"></i> Add Internship</button>
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon blue"><i class="fa-solid fa-users"></i></div>
            <div class="stat-info"><span class="stat-label">Total Students</span><span class="stat-value">248</span><span class="stat-change up"><i class="fa-solid fa-arrow-trend-up"></i> +12 this month</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green"><i class="fa-solid fa-briefcase"></i></div>
            <div class="stat-info"><span class="stat-label">Active Internships</span><span class="stat-value">34</span><span class="stat-change up"><i class="fa-solid fa-arrow-trend-up"></i> +5 this week</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange"><i class="fa-solid fa-file-circle-check"></i></div>
            <div class="stat-info"><span class="stat-label">Pending Approvals</span><span class="stat-value">17</span><span class="stat-change warn"><i class="fa-solid fa-clock"></i> Needs attention</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon purple"><i class="fa-solid fa-certificate"></i></div>
            <div class="stat-info"><span class="stat-label">Certificates Issued</span><span class="stat-value">92</span><span class="stat-change up"><i class="fa-solid fa-arrow-trend-up"></i> +8 this month</span></div>
          </div>
        </div>
""")

parts.append("""        <div class="dash-grid">
          <div class="card-box">
            <div class="card-box-header"><h3>Recent Applications</h3><a href="#" onclick="navigate(document.querySelector('[data-page=applications]'))" class="view-all">View all</a></div>
            <table class="data-table">
              <thead><tr><th>Student</th><th>Internship</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td><div class="user-cell"><div class="mini-avatar">RS</div>Rahul Sharma</div></td><td>Google - SDE</td><td>10 Jul</td><td><span class="badge pending">Pending</span></td></tr>
                <tr><td><div class="user-cell"><div class="mini-avatar teal">PK</div>Priya Kumar</div></td><td>Microsoft - DS</td><td>09 Jul</td><td><span class="badge approved">Approved</span></td></tr>
                <tr><td><div class="user-cell"><div class="mini-avatar orange">AM</div>Arjun Mehra</div></td><td>Amazon - Cloud</td><td>08 Jul</td><td><span class="badge pending">Pending</span></td></tr>
                <tr><td><div class="user-cell"><div class="mini-avatar red">NP</div>Neha Patel</div></td><td>Infosys - UX</td><td>07 Jul</td><td><span class="badge rejected">Rejected</span></td></tr>
              </tbody>
            </table>
          </div>
          <div class="side-cards">
            <div class="card-box">
              <h3 class="card-box-title">Quick Actions</h3>
              <div class="quick-actions">
                <button class="qa-btn" onclick="navigate(document.querySelector('[data-page=students]'))"><i class="fa-solid fa-user-plus"></i><span>Add Student</span></button>
                <button class="qa-btn" onclick="navigate(document.querySelector('[data-page=internships]'))"><i class="fa-solid fa-plus-circle"></i><span>Post Internship</span></button>
                <button class="qa-btn" onclick="navigate(document.querySelector('[data-page=attendance]'))"><i class="fa-solid fa-calendar-plus"></i><span>Mark Attendance</span></button>
                <button class="qa-btn" onclick="navigate(document.querySelector('[data-page=certificates]'))"><i class="fa-solid fa-file-circle-plus"></i><span>Issue Certificate</span></button>
                <button class="qa-btn" onclick="navigate(document.querySelector('[data-page=reports]'))"><i class="fa-solid fa-chart-bar"></i><span>View Reports</span></button>
                <button class="qa-btn" onclick="navigate(document.querySelector('[data-page=users]'))"><i class="fa-solid fa-users-gear"></i><span>Manage Users</span></button>
              </div>
            </div>
            <div class="card-box">
              <h3 class="card-box-title">Today's Attendance</h3>
              <div class="att-bar-row"><span>Present</span><div class="att-bar"><div class="att-fill present" style="width:72%"></div></div><span class="att-pct">72%</span></div>
              <div class="att-bar-row"><span>Absent</span><div class="att-bar"><div class="att-fill absent" style="width:28%"></div></div><span class="att-pct">28%</span></div>
            </div>
          </div>
        </div>
      </div>
""")

parts.append("""      <!-- STUDENTS PAGE -->
      <div class="page" id="page-students">
        <div class="page-header">
          <h2>Students</h2>
          <div class="header-actions">
            <div class="search-box inline"><i class="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="Search students..." oninput="filterTable(this,'students-tbody')" /></div>
            <button class="btn-primary" onclick="openModal('add-student-modal')"><i class="fa-solid fa-user-plus"></i> Add Student</button>
          </div>
        </div>
        <div class="card-box">
          <table class="data-table">
            <thead><tr><th>Name</th><th>Roll No.</th><th>Branch</th><th>Semester</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody id="students-tbody">
              <tr><td><div class="user-cell"><div class="mini-avatar">RS</div>Rahul Sharma</div></td><td>22BTCS001</td><td>CSE</td><td>6th</td><td>rahul@krmuedu.in</td><td><span class="badge approved">Active</span></td><td><div class="action-btns"><button class="act-btn edit" onclick="editRow(this)"><i class="fa-solid fa-pen"></i></button><button class="act-btn del" onclick="deleteRow(this)"><i class="fa-solid fa-trash"></i></button></div></td></tr>
              <tr><td><div class="user-cell"><div class="mini-avatar teal">PK</div>Priya Kumar</div></td><td>22BTCS002</td><td>CSE</td><td>6th</td><td>priya@krmuedu.in</td><td><span class="badge approved">Active</span></td><td><div class="action-btns"><button class="act-btn edit" onclick="editRow(this)"><i class="fa-solid fa-pen"></i></button><button class="act-btn del" onclick="deleteRow(this)"><i class="fa-solid fa-trash"></i></button></div></td></tr>
              <tr><td><div class="user-cell"><div class="mini-avatar orange">AM</div>Arjun Mehra</div></td><td>22BECE003</td><td>ECE</td><td>4th</td><td>arjun@krmuedu.in</td><td><span class="badge pending">Inactive</span></td><td><div class="action-btns"><button class="act-btn edit" onclick="editRow(this)"><i class="fa-solid fa-pen"></i></button><button class="act-btn del" onclick="deleteRow(this)"><i class="fa-solid fa-trash"></i></button></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- MENTORS PAGE -->
      <div class="page" id="page-mentors">
        <div class="page-header"><h2>Mentors</h2><div class="header-actions"><button class="btn-primary" onclick="openModal('add-mentor-modal')"><i class="fa-solid fa-user-plus"></i> Add Mentor</button></div></div>
        <div class="card-box">
          <table class="data-table">
            <thead><tr><th>Name</th><th>Department</th><th>Email</th><th>Assigned Students</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr><td><div class="user-cell"><div class="mini-avatar purple">SK</div>Dr. Sanjay Kumar</div></td><td>CSE</td><td>sanjay@krmuedu.in</td><td>24</td><td><span class="badge approved">Active</span></td><td><div class="action-btns"><button class="act-btn edit"><i class="fa-solid fa-pen"></i></button><button class="act-btn del" onclick="deleteRow(this)"><i class="fa-solid fa-trash"></i></button></div></td></tr>
              <tr><td><div class="user-cell"><div class="mini-avatar green">MR</div>Prof. Meena Rao</div></td><td>ECE</td><td>meena@krmuedu.in</td><td>18</td><td><span class="badge approved">Active</span></td><td><div class="action-btns"><button class="act-btn edit"><i class="fa-solid fa-pen"></i></button><button class="act-btn del" onclick="deleteRow(this)"><i class="fa-solid fa-trash"></i></button></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
""")

parts.append("""      <!-- INTERNSHIPS PAGE -->
      <div class="page" id="page-internships">
        <div class="page-header"><h2>Internships</h2><div class="header-actions"><button class="btn-primary" onclick="openModal('add-internship-modal')"><i class="fa-solid fa-plus"></i> Post Internship</button></div></div>
        <div class="internship-grid">
          <div class="intern-card-admin">
            <div class="intern-card-top"><div class="intern-logo purple-bg"><i class="fa-brands fa-google"></i></div><div class="intern-card-meta"><h4>Software Development Intern</h4><p>Google &middot; Remote &middot; 6 Months</p></div><span class="badge approved">Active</span></div>
            <div class="intern-card-stats"><span><i class="fa-solid fa-users"></i> 12 Applicants</span><span><i class="fa-solid fa-check-circle"></i> 3 Approved</span></div>
            <div class="intern-card-actions"><button class="act-btn edit"><i class="fa-solid fa-pen"></i> Edit</button><button class="act-btn del"><i class="fa-solid fa-trash"></i> Delete</button><button class="act-btn view"><i class="fa-solid fa-eye"></i> View Applicants</button></div>
          </div>
          <div class="intern-card-admin">
            <div class="intern-card-top"><div class="intern-logo blue-bg"><i class="fa-brands fa-microsoft"></i></div><div class="intern-card-meta"><h4>Data Science Intern</h4><p>Microsoft &middot; Hybrid &middot; 3 Months</p></div><span class="badge approved">Active</span></div>
            <div class="intern-card-stats"><span><i class="fa-solid fa-users"></i> 8 Applicants</span><span><i class="fa-solid fa-check-circle"></i> 2 Approved</span></div>
            <div class="intern-card-actions"><button class="act-btn edit"><i class="fa-solid fa-pen"></i> Edit</button><button class="act-btn del"><i class="fa-solid fa-trash"></i> Delete</button><button class="act-btn view"><i class="fa-solid fa-eye"></i> View Applicants</button></div>
          </div>
          <div class="intern-card-admin">
            <div class="intern-card-top"><div class="intern-logo orange-bg"><i class="fa-brands fa-amazon"></i></div><div class="intern-card-meta"><h4>Cloud Intern</h4><p>Amazon &middot; On-site &middot; 4 Months</p></div><span class="badge approved">Active</span></div>
            <div class="intern-card-stats"><span><i class="fa-solid fa-users"></i> 5 Applicants</span><span><i class="fa-solid fa-check-circle"></i> 1 Approved</span></div>
            <div class="intern-card-actions"><button class="act-btn edit"><i class="fa-solid fa-pen"></i> Edit</button><button class="act-btn del"><i class="fa-solid fa-trash"></i> Delete</button><button class="act-btn view"><i class="fa-solid fa-eye"></i> View Applicants</button></div>
          </div>
        </div>
      </div>
      <!-- APPLICATIONS PAGE -->
      <div class="page" id="page-applications">
        <div class="page-header"><h2>Applications</h2><div class="header-actions"><select class="filter-select" onchange="filterApplications(this.value)"><option value="">All Status</option><option>Pending</option><option>Approved</option><option>Rejected</option></select></div></div>
        <div class="card-box">
          <table class="data-table">
            <thead><tr><th>#</th><th>Student</th><th>Internship</th><th>Company</th><th>Applied On</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody id="applications-tbody">
              <tr><td>1</td><td><div class="user-cell"><div class="mini-avatar">RS</div>Rahul Sharma</div></td><td>SDE Intern</td><td>Google</td><td>10 Jul 2026</td><td><span class="badge pending">Pending</span></td><td><div class="action-btns"><button class="act-btn edit" onclick="setStatus(this,'Approved')"><i class="fa-solid fa-check"></i></button><button class="act-btn del" onclick="setStatus(this,'Rejected')"><i class="fa-solid fa-xmark"></i></button></div></td></tr>
              <tr><td>2</td><td><div class="user-cell"><div class="mini-avatar teal">PK</div>Priya Kumar</div></td><td>DS Intern</td><td>Microsoft</td><td>09 Jul 2026</td><td><span class="badge approved">Approved</span></td><td><div class="action-btns"><button class="act-btn edit" onclick="setStatus(this,'Approved')"><i class="fa-solid fa-check"></i></button><button class="act-btn del" onclick="setStatus(this,'Rejected')"><i class="fa-solid fa-xmark"></i></button></div></td></tr>
              <tr><td>3</td><td><div class="user-cell"><div class="mini-avatar orange">AM</div>Arjun Mehra</div></td><td>Cloud Intern</td><td>Amazon</td><td>08 Jul 2026</td><td><span class="badge pending">Pending</span></td><td><div class="action-btns"><button class="act-btn edit" onclick="setStatus(this,'Approved')"><i class="fa-solid fa-check"></i></button><button class="act-btn del" onclick="setStatus(this,'Rejected')"><i class="fa-solid fa-xmark"></i></button></div></td></tr>
              <tr><td>4</td><td><div class="user-cell"><div class="mini-avatar red">NP</div>Neha Patel</div></td><td>UX Intern</td><td>Infosys</td><td>07 Jul 2026</td><td><span class="badge rejected">Rejected</span></td><td><div class="action-btns"><button class="act-btn edit" onclick="setStatus(this,'Approved')"><i class="fa-solid fa-check"></i></button><button class="act-btn del" onclick="setStatus(this,'Rejected')"><i class="fa-solid fa-xmark"></i></button></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
""")

parts.append("""      <!-- ATTENDANCE PAGE -->
      <div class="page" id="page-attendance">
        <div class="page-header"><h2>Attendance Management</h2><div class="header-actions"><input type="date" class="filter-select" id="att-date" /><button class="btn-primary" onclick="saveAttendance()"><i class="fa-solid fa-save"></i> Save</button></div></div>
        <div class="card-box">
          <table class="data-table">
            <thead><tr><th>Student</th><th>Roll No.</th><th>Branch</th><th>Date</th><th>Status</th><th>Mark</th></tr></thead>
            <tbody>
              <tr><td><div class="user-cell"><div class="mini-avatar">RS</div>Rahul Sharma</div></td><td>22BTCS001</td><td>CSE</td><td class="att-date-cell">-</td><td><span class="badge approved att-status">Present</span></td><td><select class="att-select" onchange="updateAttStatus(this)"><option>Present</option><option>Absent</option><option>Late</option></select></td></tr>
              <tr><td><div class="user-cell"><div class="mini-avatar teal">PK</div>Priya Kumar</div></td><td>22BTCS002</td><td>CSE</td><td class="att-date-cell">-</td><td><span class="badge pending att-status">Absent</span></td><td><select class="att-select" onchange="updateAttStatus(this)"><option>Present</option><option selected>Absent</option><option>Late</option></select></td></tr>
              <tr><td><div class="user-cell"><div class="mini-avatar orange">AM</div>Arjun Mehra</div></td><td>22BECE003</td><td>ECE</td><td class="att-date-cell">-</td><td><span class="badge warn att-status">Late</span></td><td><select class="att-select" onchange="updateAttStatus(this)"><option>Present</option><option>Absent</option><option selected>Late</option></select></td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- CERTIFICATES PAGE -->
      <div class="page" id="page-certificates">
        <div class="page-header"><h2>Certificates</h2><div class="header-actions"><button class="btn-primary" onclick="openModal('issue-cert-modal')"><i class="fa-solid fa-file-circle-plus"></i> Issue Certificate</button></div></div>
        <div class="card-box">
          <table class="data-table">
            <thead><tr><th>Cert ID</th><th>Student</th><th>Internship</th><th>Company</th><th>Issued On</th><th>Actions</th></tr></thead>
            <tbody>
              <tr><td><span class="cert-id">CERT-001</span></td><td><div class="user-cell"><div class="mini-avatar teal">PK</div>Priya Kumar</div></td><td>DS Intern</td><td>Microsoft</td><td>01 Jul 2026</td><td><div class="action-btns"><button class="act-btn view"><i class="fa-solid fa-download"></i></button><button class="act-btn del" onclick="deleteRow(this)"><i class="fa-solid fa-trash"></i></button></div></td></tr>
              <tr><td><span class="cert-id">CERT-002</span></td><td><div class="user-cell"><div class="mini-avatar green">VS</div>Vikram Singh</div></td><td>BA Intern</td><td>TCS</td><td>28 Jun 2026</td><td><div class="action-btns"><button class="act-btn view"><i class="fa-solid fa-download"></i></button><button class="act-btn del" onclick="deleteRow(this)"><i class="fa-solid fa-trash"></i></button></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- REPORTS PAGE -->
      <div class="page" id="page-reports">
        <div class="page-header"><h2>Reports &amp; Analytics</h2><div class="header-actions"><button class="btn-outline-dark"><i class="fa-solid fa-download"></i> Export PDF</button></div></div>
        <div class="reports-grid">
          <div class="report-card"><div class="report-icon blue"><i class="fa-solid fa-users"></i></div><h4>Student Enrollment</h4><p class="report-value">248</p><p class="report-sub">Across all branches</p></div>
          <div class="report-card"><div class="report-icon green"><i class="fa-solid fa-briefcase"></i></div><h4>Placement Rate</h4><p class="report-value">68%</p><p class="report-sub">Students placed this semester</p></div>
          <div class="report-card"><div class="report-icon orange"><i class="fa-solid fa-clock"></i></div><h4>Avg. Attendance</h4><p class="report-value">74%</p><p class="report-sub">Overall this month</p></div>
          <div class="report-card"><div class="report-icon purple"><i class="fa-solid fa-certificate"></i></div><h4>Certificates Issued</h4><p class="report-value">92</p><p class="report-sub">Total to date</p></div>
        </div>
        <div class="card-box" style="margin-top:20px;">
          <h3 class="card-box-title">Branch-wise Summary</h3>
          <table class="data-table"><thead><tr><th>Branch</th><th>Students</th><th>Applied</th><th>Approved</th><th>Pending</th><th>Rejected</th></tr></thead>
          <tbody><tr><td>CSE</td><td>80</td><td>56</td><td>32</td><td>18</td><td>6</td></tr><tr><td>ECE</td><td>60</td><td>38</td><td>20</td><td>14</td><td>4</td></tr><tr><td>ME</td><td>55</td><td>22</td><td>10</td><td>10</td><td>2</td></tr><tr><td>CE</td><td>53</td><td>18</td><td>8</td><td>8</td><td>2</td></tr></tbody></table>
        </div>
      </div>
""")

parts.append("""      <!-- USER MANAGEMENT PAGE -->
      <div class="page" id="page-users">
        <div class="page-header"><h2>User Management</h2><div class="header-actions"><button class="btn-primary" onclick="openModal('add-user-modal')"><i class="fa-solid fa-user-plus"></i> Add User</button></div></div>
        <div class="card-box">
          <table class="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr><td><div class="user-cell"><div class="mini-avatar purple">AD</div>Admin Demo</div></td><td>admin@krmuedu.in</td><td><span class="role-pill admin-pill">Admin</span></td><td>01 Jan 2026</td><td><span class="badge approved">Active</span></td><td><div class="action-btns"><button class="act-btn edit"><i class="fa-solid fa-pen"></i></button><button class="act-btn del" onclick="deleteRow(this)"><i class="fa-solid fa-trash"></i></button></div></td></tr>
              <tr><td><div class="user-cell"><div class="mini-avatar">RS</div>Rahul Sharma</div></td><td>rahul@krmuedu.in</td><td><span class="role-pill student-pill">Student</span></td><td>15 Jan 2026</td><td><span class="badge approved">Active</span></td><td><div class="action-btns"><button class="act-btn edit"><i class="fa-solid fa-pen"></i></button><button class="act-btn del" onclick="deleteRow(this)"><i class="fa-solid fa-trash"></i></button></div></td></tr>
              <tr><td><div class="user-cell"><div class="mini-avatar green">MR</div>Prof. Meena Rao</div></td><td>meena@krmuedu.in</td><td><span class="role-pill mentor-pill">Mentor</span></td><td>10 Jan 2026</td><td><span class="badge approved">Active</span></td><td><div class="action-btns"><button class="act-btn edit"><i class="fa-solid fa-pen"></i></button><button class="act-btn del" onclick="deleteRow(this)"><i class="fa-solid fa-trash"></i></button></div></td></tr>
              <tr><td><div class="user-cell"><div class="mini-avatar orange">SA</div>Super Admin</div></td><td>superadmin@krmuedu.in</td><td><span class="role-pill super-pill">Super Admin</span></td><td>01 Jan 2026</td><td><span class="badge approved">Active</span></td><td><div class="action-btns"><button class="act-btn edit"><i class="fa-solid fa-pen"></i></button><button class="act-btn del" onclick="deleteRow(this)"><i class="fa-solid fa-trash"></i></button></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- SETTINGS PAGE -->
      <div class="page" id="page-settings">
        <div class="page-header"><h2>Settings</h2></div>
        <div class="settings-grid">
          <div class="card-box">
            <h3 class="card-box-title"><i class="fa-solid fa-building-columns"></i> Institute Information</h3>
            <div class="settings-form">
              <div class="form-field"><label>Institute Name</label><input type="text" value="K.R. Mangalam University" /></div>
              <div class="form-field"><label>Email Domain</label><input type="text" value="@krmuedu.in" /></div>
              <div class="form-field"><label>Admin Contact</label><input type="text" value="admin@krmuedu.in" /></div>
              <div class="form-field"><label>Website</label><input type="text" value="https://krmuedu.in" /></div>
              <button class="btn-primary" style="margin-top:8px;">Save Changes</button>
            </div>
          </div>
          <div class="card-box">
            <h3 class="card-box-title"><i class="fa-solid fa-shield-halved"></i> Security &amp; Access</h3>
            <div class="settings-form">
              <div class="toggle-row"><span>Two-Factor Authentication</span><label class="toggle"><input type="checkbox" checked /><span class="slider"></span></label></div>
              <div class="toggle-row"><span>Allow Self-Registration</span><label class="toggle"><input type="checkbox" /><span class="slider"></span></label></div>
              <div class="toggle-row"><span>Email Notifications</span><label class="toggle"><input type="checkbox" checked /><span class="slider"></span></label></div>
              <div class="toggle-row"><span>Maintenance Mode</span><label class="toggle"><input type="checkbox" /><span class="slider"></span></label></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  <div class="sidebar-overlay" id="overlay" onclick="toggleSidebar()"></div>
""")

parts.append("""  <!-- MODALS -->
  <div class="modal-backdrop" id="add-student-modal">
    <div class="modal">
      <div class="modal-header"><h3>Add Student</h3><button onclick="closeModal('add-student-modal')"><i class="fa-solid fa-xmark"></i></button></div>
      <div class="modal-body">
        <div class="form-row"><div class="form-field"><label>Full Name</label><input type="text" placeholder="Student name" /></div><div class="form-field"><label>Roll Number</label><input type="text" placeholder="22BTCS001" /></div></div>
        <div class="form-row"><div class="form-field"><label>Branch</label><select><option>CSE</option><option>ECE</option><option>ME</option><option>CE</option></select></div><div class="form-field"><label>Semester</label><select><option>1st</option><option>2nd</option><option>3rd</option><option>4th</option><option>5th</option><option>6th</option><option>7th</option><option>8th</option></select></div></div>
        <div class="form-field"><label>Email</label><input type="email" placeholder="username@krmuedu.in" /></div>
        <div class="form-field"><label>Phone</label><input type="tel" placeholder="+91 XXXXX XXXXX" /></div>
      </div>
      <div class="modal-footer"><button class="btn-outline-dark" onclick="closeModal('add-student-modal')">Cancel</button><button class="btn-primary" onclick="closeModal('add-student-modal')">Add Student</button></div>
    </div>
  </div>
  <div class="modal-backdrop" id="add-internship-modal">
    <div class="modal">
      <div class="modal-header"><h3>Post Internship</h3><button onclick="closeModal('add-internship-modal')"><i class="fa-solid fa-xmark"></i></button></div>
      <div class="modal-body">
        <div class="form-row"><div class="form-field"><label>Role Title</label><input type="text" placeholder="e.g. SDE Intern" /></div><div class="form-field"><label>Company</label><input type="text" placeholder="Company name" /></div></div>
        <div class="form-row"><div class="form-field"><label>Type</label><select><option>Remote</option><option>On-site</option><option>Hybrid</option></select></div><div class="form-field"><label>Duration</label><input type="text" placeholder="e.g. 3 Months" /></div></div>
        <div class="form-field"><label>Required Skills</label><input type="text" placeholder="React, Python..." /></div>
        <div class="form-field"><label>Description</label><textarea rows="3" placeholder="Details..."></textarea></div>
      </div>
      <div class="modal-footer"><button class="btn-outline-dark" onclick="closeModal('add-internship-modal')">Cancel</button><button class="btn-primary" onclick="closeModal('add-internship-modal')">Post Internship</button></div>
    </div>
  </div>
  <div class="modal-backdrop" id="issue-cert-modal">
    <div class="modal">
      <div class="modal-header"><h3>Issue Certificate</h3><button onclick="closeModal('issue-cert-modal')"><i class="fa-solid fa-xmark"></i></button></div>
      <div class="modal-body">
        <div class="form-field"><label>Student</label><select><option>Rahul Sharma</option><option>Priya Kumar</option><option>Vikram Singh</option></select></div>
        <div class="form-field"><label>Internship</label><select><option>Google - SDE Intern</option><option>Microsoft - DS Intern</option><option>Amazon - Cloud Intern</option></select></div>
        <div class="form-row"><div class="form-field"><label>Issue Date</label><input type="date" /></div><div class="form-field"><label>Certificate ID</label><input type="text" placeholder="CERT-XXX" /></div></div>
      </div>
      <div class="modal-footer"><button class="btn-outline-dark" onclick="closeModal('issue-cert-modal')">Cancel</button><button class="btn-primary" onclick="closeModal('issue-cert-modal')">Issue Certificate</button></div>
    </div>
  </div>
  <div class="modal-backdrop" id="add-mentor-modal">
    <div class="modal">
      <div class="modal-header"><h3>Add Mentor</h3><button onclick="closeModal('add-mentor-modal')"><i class="fa-solid fa-xmark"></i></button></div>
      <div class="modal-body">
        <div class="form-row"><div class="form-field"><label>Full Name</label><input type="text" placeholder="Dr. / Prof. Name" /></div><div class="form-field"><label>Department</label><select><option>CSE</option><option>ECE</option><option>ME</option><option>CE</option></select></div></div>
        <div class="form-field"><label>Email</label><input type="email" placeholder="mentor@krmuedu.in" /></div>
      </div>
      <div class="modal-footer"><button class="btn-outline-dark" onclick="closeModal('add-mentor-modal')">Cancel</button><button class="btn-primary" onclick="closeModal('add-mentor-modal')">Add Mentor</button></div>
    </div>
  </div>
  <div class="modal-backdrop" id="add-user-modal">
    <div class="modal">
      <div class="modal-header"><h3>Add User</h3><button onclick="closeModal('add-user-modal')"><i class="fa-solid fa-xmark"></i></button></div>
      <div class="modal-body">
        <div class="form-row"><div class="form-field"><label>Full Name</label><input type="text" placeholder="User name" /></div><div class="form-field"><label>Role</label><select><option>Student</option><option>Mentor</option><option>Admin</option><option>Super Admin</option></select></div></div>
        <div class="form-field"><label>Email</label><input type="email" placeholder="user@krmuedu.in" /></div>
        <div class="form-field"><label>Password</label><input type="password" placeholder="Set password" /></div>
      </div>
      <div class="modal-footer"><button class="btn-outline-dark" onclick="closeModal('add-user-modal')">Cancel</button><button class="btn-primary" onclick="closeModal('add-user-modal')">Create User</button></div>
    </div>
  </div>
""")

parts.append("""  <script>
    const role = sessionStorage.getItem('krmu_role') || 'admin';
    const name = sessionStorage.getItem('krmu_name') || 'Admin';
    if (role === 'student' || role === 'mentor') { window.location.href = 'student-dashboard.html'; }
    document.getElementById('user-name').textContent   = name;
    document.getElementById('user-avatar').textContent = name.charAt(0).toUpperCase();
    document.getElementById('welcome-name').textContent = name;
    document.getElementById('sidebar-role').textContent = role === 'superadmin' ? 'Super Admin' : 'Admin';
    function navigate(el) {
      if (!el) return;
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      el.classList.add('active');
      document.getElementById('page-' + el.dataset.page).classList.add('active');
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('overlay').classList.remove('show');
    }
    function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('overlay').classList.toggle('show'); }
    function toggleDropdown() { document.getElementById('dropdown').classList.toggle('show'); }
    document.addEventListener('click', e => { if (!e.target.closest('.avatar-menu')) document.getElementById('dropdown').classList.remove('show'); });
    function toggleTheme() { document.body.classList.toggle('dark'); const i = document.getElementById('theme-icon'); i.classList.toggle('fa-moon'); i.classList.toggle('fa-sun'); }
    function logout() { sessionStorage.clear(); window.location.href = 'login.html'; }
    function openModal(id)  { document.getElementById(id).classList.add('show'); }
    function closeModal(id) { document.getElementById(id).classList.remove('show'); }
    document.querySelectorAll('.modal-backdrop').forEach(m => { m.addEventListener('click', e => { if (e.target === m) m.classList.remove('show'); }); });
    function deleteRow(btn) { if (confirm('Delete this record?')) btn.closest('tr').remove(); }
    function editRow(btn) { alert('Edit functionality — connect to backend.'); }
    function setStatus(btn, status) { const b = btn.closest('tr').querySelector('.badge'); b.textContent = status; b.className = 'badge ' + (status === 'Approved' ? 'approved' : 'rejected'); }
    function filterTable(input, id) { const q = input.value.toLowerCase(); document.querySelectorAll('#'+id+' tr').forEach(r => { r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none'; }); }
    function filterApplications(s) { document.querySelectorAll('#applications-tbody tr').forEach(r => { const t = r.querySelector('.badge') ? r.querySelector('.badge').textContent : ''; r.style.display = (!s || t===s) ? '' : 'none'; }); }
    function updateAttStatus(sel) { const b = sel.closest('tr').querySelector('.att-status'); const m = {Present:'approved',Absent:'pending',Late:'warn'}; b.textContent = sel.value; b.className = 'badge att-status '+(m[sel.value]||''); }
    function saveAttendance() { const d = document.getElementById('att-date').value || new Date().toLocaleDateString(); document.querySelectorAll('.att-date-cell').forEach(td => td.textContent = d); alert('Attendance saved for '+d); }
    document.getElementById('att-date').value = new Date().toISOString().split('T')[0];
  </script>
</body>
</html>""")

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(''.join(parts))
print('Done! Written to', OUT)
