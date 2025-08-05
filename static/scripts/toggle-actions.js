function toggleActions() {
    const anyChecked = document.querySelectorAll('.row-checkbox:checked').length > 0;
  
    const editBtn = document.querySelector('.edit-button');
    const deleteBtn = document.querySelector('.delete-button');
    const printBtn = document.getElementById('printBtn');
    const selectAllBtn = document.getElementById('selectAllBtn');
  
    if (editBtn && deleteBtn) {
      if (anyChecked) {
        editBtn.classList.remove('disabled-button');
        deleteBtn.classList.remove('disabled-button');
      } else {
        editBtn.classList.add('disabled-button');
        deleteBtn.classList.add('disabled-button');
      }
    }
  
    if (printBtn) {
      if (anyChecked) {
        printBtn.classList.remove('disabled');
      } else {
        printBtn.classList.add('disabled');
      }
    }
  
    if (selectAllBtn) {
      if (anyChecked) {
        selectAllBtn.classList.remove('disabled-button');
        selectAllBtn.disabled = false;
      } else {
        selectAllBtn.classList.add('disabled-button');
        selectAllBtn.disabled = true;
      }
      updateSelectAllButtonState();
    }
  }
   
  // تحديث حالة زر تحديد الكل حسب اختيار الصفوف 
  function updateSelectAllButtonState() {
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    const selectAllBtn = document.getElementById('selectAllBtn');
  
    if (selectAllBtn) {
      const allChecked = Array.from(rowCheckboxes).every(chk => chk.checked);
      selectAllBtn.classList.toggle('active', allChecked);
    }
  }
  
  // حدث عند تغيير أي خانة اختيار (checkbox)
  document.querySelectorAll('.row-checkbox').forEach(chk => {
    chk.addEventListener('change', toggleActions);
  });
  
  // زر تحديد الكل
  const selectAllBtn = document.getElementById('selectAllBtn');
  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      if (!selectAllBtn.classList.contains('disabled-button')) {
        const rowCheckboxes = document.querySelectorAll('.row-checkbox');
        const selectAll = !selectAllBtn.classList.contains('active');
  
        rowCheckboxes.forEach(chk => {
          chk.checked = selectAll;
        });
  
        selectAllBtn.classList.toggle('active', selectAll);
  
        toggleActions(); // تحديث باقي الأزرار بناءً على التحديد
      }
    });
  }
  
  // تعطيل الأزرار عند تحميل الصفحة
  window.addEventListener('DOMContentLoaded', () => {
    const editBtn = document.querySelector('.edit-button');
    const deleteBtn = document.querySelector('.delete-button');
    const printBtn = document.getElementById('printBtn');
    const selectAllBtn = document.getElementById('selectAllBtn');
  
    if (editBtn) editBtn.classList.add('disabled-button');
    if (deleteBtn) deleteBtn.classList.add('disabled-button');
    if (printBtn) printBtn.classList.add('disabled');
    if (selectAllBtn) {
      selectAllBtn.classList.add('disabled-button');
      selectAllBtn.disabled = true;
    }
  });
// التحكم في حالة التحويلة (نشطة / غير نشطة)
document.querySelectorAll('.status-box').forEach(box => {
    box.addEventListener('click', () => {
      document.querySelectorAll('.status-box').forEach(b => b.classList.remove('active'));
      box.classList.add('active');
    });
  });

  // التحكم في نوع التحويلة (عامة / خاصة)
  document.querySelectorAll('.type-box').forEach(box => {
    box.addEventListener('click', () => {
      document.querySelectorAll('.type-box').forEach(b => b.classList.remove('active'));
      box.classList.add('active');
    });
  });
    

  function attachCheckboxListeners() {
    document.querySelectorAll('.row-checkbox').forEach(chk => {
      chk.removeEventListener('change', toggleActions);
      chk.addEventListener('change', toggleActions);
    });
  }
  
// دالة لتحميل البيانات من API
async function loadConversions() {
  // جمع بيانات الفلاتر
  const number = document.getElementById('filterNumber').value;
  const title = document.getElementById('filterTitle').value;
  const department = document.getElementById('filterDepartment').value;
  const subDepartment = document.getElementById('filterSubDepartment').value;
  const employee = document.getElementById('filterEmployee').value;

  const params = new URLSearchParams({
    number,
    title,
    department,
    sub_department: subDepartment,
    employee_name: employee
  });

  try {
    const response = await fetch(`/api/conversions?${params.toString()}`);
    const result = await response.json();

    const tableBody = document.querySelector('.transfers2-table tbody');
    tableBody.innerHTML = ''; // نمسح الجدول القديم

    result.conversions.forEach(conv => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td><input type="checkbox" class="row-checkbox" onchange="toggleActions()" /></td>
        <td>${conv.conversion_number}</td>
        <td>${conv.conversion_title}</td>
        <td>${conv.employee_name}</td>
        <td>${conv.department}</td>
        <td>${conv.sub_department}</td>
        <td><span class="status ${conv.conversion_status === 'نشطة' ? 'active' : 'inactive'}">${conv.conversion_status}</span></td>
        <td>${conv.creation_date}</td>
      `;

      tableBody.appendChild(row);
    });

    attachCheckboxListeners(); // ربط الأحداث مع مربعات الاختيار
    toggleActions(); // تحديث حالة الأزرار
if (!showAllMode) {  // إذا تستخدم متغير للتحكم في وضع "عرض الكل"
      updateLastSearchTable(result.conversions);
    }
  } catch (error) {
    console.error('فشل في تحميل التحويلات:', error);
  }
}

  let showAllMode = false;
document.querySelector('.search-button').addEventListener('click', async () => {
  showAllMode = false; // بحث عادي، يحدث آخر نتائج البحث

  // باقي الكود كالمعتاد
  const number = document.getElementById('filterNumber').value.trim();
  const title = document.getElementById('filterTitle').value.trim();
  const department = document.getElementById('filterDepartment').value;
  const subDepartment = document.getElementById('filterSubDepartment').value;
  const employee = document.getElementById('filterEmployee').value;

  const noFiltersUsed = !number && !title && !department && !subDepartment && !employee;

  if (noFiltersUsed) {
    alert('الرجاء اختيار فلتر واحد على الأقل أو كتابة قيمة للبحث.');
    return;
  }
  showResultsControls();
  document.querySelector('.results2-container').style.display = 'block';
  await loadConversions();
});

  
   
  async function loadFilterOptions() {
    try {
      const response = await fetch('/api/filters');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
  
      fillSelect('#filterDepartment', data.department);
      fillSelect('#filterSubDepartment', data.sub_department);
      fillSelect('#filterEmployee', data.employee_name);
    } catch (error) {
      console.error('فشل في تحميل الفلاتر:', error);
    }
  }
  
  function fillSelect(selector, options) {
    const select = document.querySelector(selector);
    if (!select) return;
  
    // احتفظ بالخيار الأول (placeholder)
    const firstOption = select.querySelector('option');
    select.innerHTML = '';
    if (firstOption) select.appendChild(firstOption);
  
    options.forEach(opt => {
      if(opt) { // تأكد أن الخيار ليس فارغاً أو null
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
      }
    });
  }
  document.addEventListener('DOMContentLoaded', loadFilterOptions);
  
document.getElementById('showall').addEventListener('click', async () => {
  showAllMode = true; // عرض الكل، لا يحدث آخر نتائج البحث

  // مسح الفلاتر
  document.getElementById('filterNumber').value = '';
  document.getElementById('filterTitle').value = '';
  document.getElementById('filterDepartment').value = '';
  document.getElementById('filterSubDepartment').value = '';
  document.getElementById('filterEmployee').value = '';
  showResultsControls();
  document.querySelector('.results2-container').style.display = 'block';
  await loadConversions();
});
// استدعاء الدالة لتحميل آخر نتائج البحث عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
  const savedResults = JSON.parse(localStorage.getItem('last_search_results')) || [];
  renderLastSearchTable(savedResults);
});
// تحديث اخر نتائج البحث صفحة المستخدم
function updateLastSearchTable(newConversions) {
  if (!Array.isArray(newConversions) || newConversions.length === 0) return;

  const old = JSON.parse(localStorage.getItem('last_search_results')) || [];
  const combined = [...newConversions, ...old];

  const seen = new Set();
  const unique = combined.filter(conv => {
    if (seen.has(conv.conversion_number)) return false;
    seen.add(conv.conversion_number);
    return true;
  });

  const recent = unique.slice(0, 3);

  localStorage.setItem('last_search_results', JSON.stringify(recent));
  renderLastSearchTable(recent);
}


//دالة لعرض اخر النتايج داخل الجدول
function renderLastSearchTable(list) {
  const tableBody = document.querySelector('.lastresults-container tbody');
  if (!tableBody) return;

  tableBody.innerHTML = ''; // نمسح القديم

  list.forEach(conv => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${conv.conversion_number}</td>
      <td>${conv.conversion_title}</td>
      <td>${conv.employee_name}</td>
      <td>${conv.department}</td>
      <td>${conv.sub_department}</td>
      <td><span class="status ${conv.conversion_status === 'نشطة' ? 'active' : 'inactive'}">${conv.conversion_status}</span></td>
      <td>${conv.creation_date}</td>
    `;

    tableBody.appendChild(row);
  });
}

document.getElementById('printBtn').addEventListener('click', () => {
  // إذا الزر معطل، ما نسوي شي
  const printBtn = document.getElementById('printBtn');
  if (printBtn.classList.contains('disabled')) return;

  const checkedRows = Array.from(document.querySelectorAll('.row-checkbox:checked'))
    .map(chk => {
      const tr = chk.closest('tr');
      return {
        number: tr.children[1].textContent.trim(),
        title: tr.children[2].textContent.trim(),
        employee: tr.children[3].textContent.trim(),
        department: tr.children[4].textContent.trim(),
        subDepartment: tr.children[5].textContent.trim(),
        status: tr.children[6].textContent.trim(),
        date: tr.children[7].textContent.trim(),
      };
    });

  if (checkedRows.length === 0) {
    alert('الرجاء اختيار تحويلة واحدة على الأقل للطباعة.');
    return;
  }

  let printContent = `
    <h2>التحويلات المختارة للطباعة</h2>
    <table border="1" style="width:100%;border-collapse:collapse;text-align:center;">
      <thead>
        <tr>
          <th>رقم التحويلة</th>
          <th>مسمى التحويلة</th>
          <th>اسم الموظف</th>
          <th>الإدارة</th>
          <th>الإدارة الفرعية</th>
          <th>حالة التحويلة</th>
          <th>تاريخ الإنشاء</th>
        </tr>
      </thead>
      <tbody>
  `;

  checkedRows.forEach(conv => {
    printContent += `
      <tr>
        <td>${conv.number}</td>
        <td>${conv.title}</td>
        <td>${conv.employee}</td>
        <td>${conv.department}</td>
        <td>${conv.subDepartment}</td>
        <td>${conv.status}</td>
        <td>${conv.date}</td>
      </tr>
    `;
  });

  printContent += '</tbody></table>';

  const printWindow = window.open('', '', 'width=900,height=600');
  printWindow.document.write(`<html><head><title>طباعة التحويلات</title></head><body>${printContent}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
});

function showResultsControls() {
  document.querySelector('.results2-title').style.display = 'block';
  document.getElementById('printBtn').style.display = 'block';
  document.getElementById('selectAllBtn').style.display = 'inline-block';
}
document.addEventListener("DOMContentLoaded", () => {
const isAdminPage = window.location.pathname === "/admin" || window.location.pathname.includes("/admin");

  if (isAdminPage) {
    fetchConversions(); // ✅ فقط للأدمن
  }
});

async function fetchConversions() {
  try {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})  // ✅ فلتر فاضي لعرض الكل
    });

    const results = await res.json();
    const tbody = document.querySelector('.transfers2-table tbody');
    tbody.innerHTML = "";

    if (results.length === 0) {
      tbody.innerHTML = "<tr><td colspan='8'>لا توجد نتائج حالياً</td></tr>";
      return;
    }

    results.forEach(result => {
      const row = `
        <tr>
          <td><input type="checkbox" class="row-checkbox" onchange="toggleActions(this)" /></td>
          <td>${result.conversion_number}</td>
          <td>${result.conversion_title}</td>
          <td>${result.employee_name}</td>
          <td>${result.department}</td>
          <td>${result.sub_department}</td>
          <td>
            <span class="status ${result.status === 'نشطة' ? 'active' : 'inactive'}">
              ${result.status}
            </span>
          </td>
          <td>${result.created_at}</td>
        </tr>
      `;
      tbody.insertAdjacentHTML('beforeend', row);
    });
    
  } catch (error) {
    console.error("فشل في تحميل التحويلات:", error);
    alert("حدث خطأ أثناء تحميل البيانات");
  }
}



// تحديث حالة الزر حسب وجود صفوف محددة (شغلها لما يتغير تحديد checkbox)
function toggleAdminPrintButton() {
  const anyChecked = document.querySelectorAll('.row-checkbox:checked').length > 0;
  const printBtn = document.getElementById('adminPrintBtn');
  if (!printBtn) return;

  if (anyChecked) {
    printBtn.disabled = false;
    printBtn.classList.remove('disabled');
  } else {
    printBtn.disabled = true;
    printBtn.classList.add('disabled');
  }
}

// ربط حدث التغيير على checkboxes
document.querySelectorAll('.row-checkbox').forEach(chk => {
  chk.addEventListener('change', toggleAdminPrintButton);
});

// ربط حدث الطباعة على الزر
document.getElementById('adminPrintBtn').addEventListener('click', () => {
  // تحقق إذا الزر غير معطل
  const printBtn = document.getElementById('adminPrintBtn');
  if (printBtn.classList.contains('disabled') || printBtn.disabled) return;

  const checkedRows = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(chk => {
    const tr = chk.closest('tr');
    return {
      number: tr.children[1].textContent.trim(),
      title: tr.children[2].textContent.trim(),
      employee: tr.children[3].textContent.trim(),
      department: tr.children[4].textContent.trim(),
      subDepartment: tr.children[5].textContent.trim(),
      status: tr.children[6].textContent.trim(),
      date: tr.children[7].textContent.trim(),
    };
  });

  if (checkedRows.length === 0) {
    alert('الرجاء اختيار تحويلة واحدة على الأقل للطباعة.');
    return;
  }

  let printContent = `
    <h2 style="text-align:center;">التحويلات المختارة للطباعة</h2>
    <table border="1" style="width:100%;border-collapse:collapse;text-align:center;">
      <thead>
        <tr>
          <th>رقم التحويلة</th>
          <th>مسمى التحويلة</th>
          <th>اسم الموظف</th>
          <th>الإدارة</th>
          <th>الإدارة الفرعية</th>
          <th>حالة التحويلة</th>
          <th>تاريخ الإنشاء</th>
        </tr>
      </thead>
      <tbody>
  `;

  checkedRows.forEach(conv => {
    printContent += `
      <tr>
        <td>${conv.number}</td>
        <td>${conv.title}</td>
        <td>${conv.employee}</td>
        <td>${conv.department}</td>
        <td>${conv.subDepartment}</td>
        <td>${conv.status}</td>
        <td>${conv.date}</td>
      </tr>
    `;
  });

  printContent += '</tbody></table>';

  const printWindow = window.open('', '', 'width=900,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>طباعة التحويلات</title>
        <style>
          body { font-family: "Cairo", sans-serif; direction: rtl; text-align: center; }
          table { margin: auto; border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #000; padding: 8px; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>${printContent}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
});

// تأكد تفعيل الزر عند تحميل الصفحة حسب حالة الاختيار
window.addEventListener('DOMContentLoaded', toggleAdminPrintButton);
