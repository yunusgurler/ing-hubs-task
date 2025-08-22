const DICT = {
  en: {
    appTitle: "Employee Manager",
    employees: "Employees",
    addNew: "Add New",
    editEmployee: "Edit Employee",
    createEmployee: "Create Employee",
    updateEmployee: "Update Employee",
    delete: "Delete",
    edit: "Edit",
    search: "Search",
    listView: "List",
    tableView: "Table",
    itemsPerPage: "Items per page",
    page: "Page",
    of: "of",
    confirmDelete: "Delete this employee?",
    confirmUpdate: "Update this employee?",
    firstName: "First Name",
    lastName: "Last Name",
    dateOfEmployment: "Date of Employment",
    dateOfBirth: "Date of Birth",
    phoneNumber: "Phone",
    emailAddress: "Email",
    department: "Department",
    position: "Position",
    departmentAnalytics: "Analytics",
    departmentTech: "Tech",
    positionJunior: "Junior",
    positionSenior: "Senior",
    positionMedior: "Medior",
    required: "This field is required",
    invalidEmail: "Invalid email format",
    invalidPhone: "Invalid phone format",
    invalidDate: "Invalid date",
    dobInFuture: "Date of birth must be in the past",
    doeInPast: "Date of employment cannot be in the future",
    dobBeforeDoe: "Birth date must be before employment date",
    emailNotUnique: "Email must be unique",
    save: "Save",
    cancel: "Cancel",
    view: "View",
    lang: "Language",
    empty: "No employees to show",
    actions: "Actions",
    employeeList: "Employee List",
    updateEmployee: "Update Employee",
    addEmployee: "Add Employee",
    youAreEditing: "You are editing ",
    proceed: "Proceed",
    areYouSure: "Are you sure?",
    selectedEmployeeRecordOf: "Selected employee record of",
    willBeDeleted: "will be deleted",
    searchPlaceholder: "Search employees",
  },
  tr: {
    appTitle: "Çalışan Yöneticisi",
    employees: "Çalışanlar",
    addNew: "Çalışan Ekle",
    editEmployee: "Çalışanı Düzenle",
    createEmployee: "Çalışan Oluştur",
    updateEmployee: "Çalışanı Güncelle",
    delete: "Sil",
    edit: "Düzenle",
    search: "Ara",
    listView: "Liste",
    tableView: "Tablo",
    itemsPerPage: "Sayfa başına",
    page: "Sayfa",
    of: "/",
    confirmDelete: "Bu çalışan silinsin mi?",
    confirmUpdate: "Bu çalışan güncellensin mi?",
    firstName: "Ad",
    lastName: "Soyad",
    dateOfEmployment: "İşe Başlama Tarihi",
    dateOfBirth: "Doğum Tarihi",
    phoneNumber: "Telefon",
    emailAddress: "E-posta",
    department: "Departman",
    position: "Pozisyon",
    departmentAnalytics: "Analitik",
    departmentTech: "Teknoloji",
    positionJunior: "Junior",
    positionSenior: "Senior",
    positionMedior: "Medior",
    required: "Bu alan zorunludur",
    invalidEmail: "Geçersiz e-posta formatı",
    invalidPhone: "Geçersiz telefon formatı",
    invalidDate: "Geçersiz tarih",
    dobInFuture: "Doğum tarihi geçmişte olmalı",
    doeInPast: "İşe başlama tarihi gelecekte olamaz",
    dobBeforeDoe: "Doğum tarihi, işe girişten önce olmalı",
    emailNotUnique: "E-posta benzersiz olmalı",
    save: "Kaydet",
    cancel: "İptal",
    view: "Görünüm",
    lang: "Dil",
    empty: "Gösterilecek çalışan yok",
    actions: "İşlemler",
    employeeList: "Çalışan Listesi",
    addEmployee: "Çalışan Ekle",
    updateEmployee: "Çalışanı Güncelle",
    youAreEditing: "Şu kişiyi düzenliyorsunuz: ",
    proceed: "Devam",
    areYouSure: "Emin misiniz?",
    selectedEmployeeRecordOf: "Seçilen çalışan kaydı",
    willBeDeleted: "silinecek",
    searchPlaceholder: "Çalışan ara",
  },
};

const listeners = new Set();

function getLanguage(){
  let lang = document.documentElement.getAttribute('lang') || localStorage.getItem('lang') || 'en';
  lang = (lang || 'en').startsWith('tr') ? 'tr' : 'en';
  return lang;
}

let currentLang = getLanguage();

export function t(key){
  const lang = currentLang;
  return (DICT[lang] && DICT[lang][key]) || key;
}

export function setLanguage(lang){
  currentLang = (lang || 'en').startsWith('tr') ? 'tr' : 'en';
  document.documentElement.setAttribute('lang', currentLang);
  localStorage.setItem('lang', currentLang);
  listeners.forEach(cb => cb(currentLang));
}

export function onLangChange(cb){
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function language(){
  return currentLang;
}

// initialize from DOM once
setLanguage(getLanguage());
