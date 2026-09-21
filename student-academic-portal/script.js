const API_URL = "https://jsonplaceholder.typicode.com/users";

const academicData = {
  1: {course:"B.Tech", semester:5, cgpa:8.7},
  2: {course:"BCA", semester:3, cgpa:9.1},
  3: {course:"MCA", semester:2, cgpa:8.4},
  4: {course:"BBA", semester:4, cgpa:8.8},
  5: {course:"MBA", semester:3, cgpa:9.0},
  6: {course:"B.Tech", semester:6, cgpa:8.2},
  7: {course:"BCA", semester:4, cgpa:8.9},
  8: {course:"MCA", semester:1, cgpa:8.6},
  9: {course:"BBA", semester:2, cgpa:8.1},
  10:{course:"MBA", semester:4, cgpa:9.2}
};

function getAcademic(id){
  return academicData[id] || {course:"B.Tech",semester:1,cgpa:8.0};
}

function studentRow(student){
  return `
    <tr>
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${student.phone}</td>
      <td>${student.address?.city || "-"}</td>
      <td>
        <button class="action view" onclick="viewStudent(${student.id})">View</button>
        <button class="action edit" onclick="editStudent(${student.id})">Edit</button>
        <button class="action delete" onclick="deleteStudent(${student.id})">Delete</button>
      </td>
    </tr>`;
}

async function loadStudents(){
  const body=document.getElementById("studentTableBody");
  if(!body)return;
  try{
    const response=await fetch(API_URL);
    const students=await response.json();
    window.students=students;
    renderStudents(students);
  }catch(error){
    body.innerHTML='<tr><td colspan="6" class="center">Unable to load students.</td></tr>';
  }
}

function renderStudents(students){
  const body=document.getElementById("studentTableBody");
  if(!students.length){
    body.innerHTML='<tr><td colspan="6" class="center">No students found.</td></tr>';
    return;
  }
  body.innerHTML=students.map(studentRow).join("");
}

function setupSearch(){
  const input=document.getElementById("searchInput");
  if(!input)return;
  input.addEventListener("input",()=>{
    const term=input.value.toLowerCase();
    renderStudents((window.students||[]).filter(s=>s.name.toLowerCase().includes(term)));
  });
}

function viewStudent(id){
  location.href=`details.html?id=${id}`;
}

function editStudent(id){
  location.href=`edit-student.html?id=${id}`;
}

async function deleteStudent(id){
  if(!confirm("Are you sure you want to delete this student?"))return;
  try{
    const response=await fetch(`${API_URL}/${id}`,{method:"DELETE"});
    if(response.ok){
      window.students=(window.students||[]).filter(s=>s.id!==id);
      renderStudents(window.students);
      alert("Student deleted successfully.");
    }
  }catch(error){alert("Delete operation failed.");}
}

function setupAddForm(){
  const form=document.getElementById("addStudentForm");
  if(!form)return;
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    const payload={
      name:data.name,email:data.email,phone:data.phone,
      website:"student.edu",
      academic:{course:data.course,semester:Number(data.semester),cgpa:Number(data.cgpa)}
    };
    try{
      const response=await fetch(API_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload)
      });
      const result=await response.json();
      alert(`Student added successfully! API ID: ${result.id}`);
      form.reset();
      location.href="students.html";
    }catch(error){alert("Unable to add student.");}
  });
}

async function loadEditStudent(){
  const form=document.getElementById("editStudentForm");
  if(!form)return;
  const id=new URLSearchParams(location.search).get("id");
  if(!id)return;
  try{
    const response=await fetch(`${API_URL}/${id}`);
    const student=await response.json();
    const academic=getAcademic(Number(id));
    document.getElementById("editName").value=student.name;
    document.getElementById("editEmail").value=student.email;
    document.getElementById("editPhone").value=student.phone;
    document.getElementById("editCourse").value=academic.course;
    document.getElementById("editSemester").value=academic.semester;
    document.getElementById("editCgpa").value=academic.cgpa;

    form.addEventListener("submit",async e=>{
      e.preventDefault();
      const data=Object.fromEntries(new FormData(form).entries());
      const payload={
        name:data.name,email:data.email,phone:data.phone,
        academic:{course:data.course,semester:Number(data.semester),cgpa:Number(data.cgpa)}
      };
      const update=await fetch(`${API_URL}/${id}`,{
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload)
      });
      if(update.ok){
        alert("Student updated successfully!");
        location.href="students.html";
      }
    });
  }catch(error){alert("Unable to load student.");}
}

async function loadDetails(){
  const box=document.getElementById("studentDetails");
  if(!box)return;
  const id=new URLSearchParams(location.search).get("id");
  if(!id){box.textContent="Student not found.";return;}
  try{
    const response=await fetch(`${API_URL}/${id}`);
    const student=await response.json();
    const academic=getAcademic(Number(id));
    box.innerHTML=`
      <h2>${student.name}</h2>
      <p><strong>Student ID:</strong> ${student.id}</p>
      <p><strong>Email:</strong> ${student.email}</p>
      <p><strong>Phone:</strong> ${student.phone}</p>
      <p><strong>Course:</strong> ${academic.course}</p>
      <p><strong>Semester:</strong> ${academic.semester}</p>
      <p><strong>CGPA:</strong> ${academic.cgpa}</p>
      <p><strong>City:</strong> ${student.address?.city || "-"}</p>
      <p><strong>Company:</strong> ${student.company?.name || "-"}</p>`;
  }catch(error){box.textContent="Unable to load student details.";}
}

async function loadDashboard(){
  const total=document.getElementById("totalStudents");
  const courses=document.getElementById("totalCourses");
  if(!total)return;
  try{
    const response=await fetch(API_URL);
    const students=await response.json();
    total.textContent=students.length;
    courses.textContent=new Set(students.map(s=>getAcademic(s.id).course)).size;
  }catch(error){total.textContent="0";courses.textContent="0";}
}

document.addEventListener("DOMContentLoaded",()=>{
  loadDashboard();
  loadStudents();
  setupSearch();
  setupAddForm();
  loadEditStudent();
  loadDetails();
});
