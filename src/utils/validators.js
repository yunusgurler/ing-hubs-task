export function isRequired(v){ return v !== undefined && v !== null && String(v).trim() !== ''; }

export function isEmail(v){
  if(!isRequired(v)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
}

export function isPhone(v){
  if(!isRequired(v)) return false;
  // Simple: +xxxxxxxxxxx or local 10-14 digits
  return /^(\+?\d{10,15})$/.test(String(v).replace(/\s|-/g,''));
}

export function isDate(v){
  if(!isRequired(v)) return false;
  const d = new Date(v);
  return !isNaN(d.getTime());
}

export function notFuture(v){
  const d = new Date(v);
  const now = new Date();
  return d.getTime() <= now.getTime();
}

export function before(a, b){
  const da = new Date(a), db = new Date(b);
  if(isNaN(da.getTime()) || isNaN(db.getTime())) return false;
  return da.getTime() < db.getTime();
}
