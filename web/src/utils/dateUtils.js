import moment from "moment";
import "moment/locale/pt-br";

moment.locale("pt-br");

export const parseUTCDate = (dateString) => {
  if (!dateString) return null;
  
  if (typeof dateString === 'string' && dateString.endsWith('Z')) {
    return moment.utc(dateString).local();
  }
  
  return moment(dateString).local();
};

export const toUTCDate = (date) => {
  if (!date) return null;
  
  const m = moment.isMoment(date) ? date : moment(date);
  if (!m.isValid()) return null;
  
  return m.utc().format('YYYY-MM-DDTHH:mm:ss') + '.000000Z';
};

export const formatDate = (date, format = 'DD/MM/YYYY HH:mm') => {
  if (!date) return '';
  
  const m = parseUTCDate(date);
  if (!m || !m.isValid()) return '';
  
  return m.format(format);
};

export const formatSchedulingDate = (date) => {
  if (!date) return '';
  
  const m = parseUTCDate(date);
  if (!m || !m.isValid()) return '';
  
  const today = moment().startOf("day");
  const tomorrow = moment().add(1, "day").startOf("day");

  if (m.isSame(today, "day")) {
    return `Hoje, ${m.format("HH:mm")}`;
  } else if (m.isSame(tomorrow, "day")) {
    return `Amanhã, ${m.format("HH:mm")}`;
  }
  
  return m.format("ddd, DD/MM [às] HH:mm");
};

export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  const m1 = parseUTCDate(date1);
  const m2 = parseUTCDate(date2);
  
  if (!m1 || !m2 || !m1.isValid() || !m2.isValid()) return false;
  
  return m1.isSame(m2, "day");
};

export const isAfter = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  const m1 = parseUTCDate(date1);
  const m2 = parseUTCDate(date2);
  
  if (!m1 || !m2 || !m1.isValid() || !m2.isValid()) return false;
  
  return m1.isAfter(m2);
};

export const isBefore = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  const m1 = parseUTCDate(date1);
  const m2 = parseUTCDate(date2);
  
  if (!m1 || !m2 || !m1.isValid() || !m2.isValid()) return false;
  
  return m1.isBefore(m2);
};

export const isSameOrAfter = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  const m1 = parseUTCDate(date1);
  const m2 = parseUTCDate(date2);
  
  if (!m1 || !m2 || !m1.isValid() || !m2.isValid()) return false;
  
  return m1.isSameOrAfter(m2);
};

export const diffMinutes = (date1, date2) => {
  if (!date1 || !date2) return 0;
  
  const m1 = parseUTCDate(date1);
  const m2 = parseUTCDate(date2);
  
  if (!m1 || !m2 || !m1.isValid() || !m2.isValid()) return 0;
  
  return m1.diff(m2, 'minutes');
};

export const diffHours = (date1, date2) => {
  if (!date1 || !date2) return 0;
  
  const m1 = parseUTCDate(date1);
  const m2 = parseUTCDate(date2);
  
  if (!m1 || !m2 || !m1.isValid() || !m2.isValid()) return 0;
  
  return m1.diff(m2, 'hours');
};

export const now = () => {
  return moment();
};

export const startOfDay = (date = null) => {
  const m = date ? parseUTCDate(date) : moment();
  return m ? m.clone().startOf("day") : moment().startOf("day");
};

export const endOfDay = (date = null) => {
  const m = date ? parseUTCDate(date) : moment();
  return m ? m.clone().endOf("day") : moment().endOf("day");
};

export const formatTime = (date) => {
  if (!date) return '';
  
  const m = parseUTCDate(date);
  if (!m || !m.isValid()) return '';
  
  return m.format('HH:mm');
};

export const formatDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  
  const m1 = parseUTCDate(startDate);
  const m2 = parseUTCDate(endDate);
  
  if (!m1 || !m2 || !m1.isValid() || !m2.isValid()) return '';
  
  return moment.duration(m2.diff(m1)).humanize();
};

export const sortDates = (dates, direction = 'asc') => {
  return [...dates].sort((a, b) => {
    const dateA = parseUTCDate(a.date || a);
    const dateB = parseUTCDate(b.date || b);
    
    if (!dateA || !dateB || !dateA.isValid() || !dateB.isValid()) return 0;
    
    const diff = dateA.diff(dateB);
    return direction === 'asc' ? diff : -diff;
  });
};

export const toUTCStartOfDay = (dateString) => {
  if (!dateString) return null;
  
  const m = moment.isMoment(dateString) ? dateString : moment(dateString, 'YYYY-MM-DD');
  if (!m.isValid()) return null;
  
  return m.startOf('day').utc().format('YYYY-MM-DD HH:mm:ss');
};

export const toUTCEndOfDay = (dateString) => {
  if (!dateString) return null;
  
  const m = moment.isMoment(dateString) ? dateString : moment(dateString, 'YYYY-MM-DD');
  if (!m.isValid()) return null;
  
  return m.endOf('day').utc().format('YYYY-MM-DD HH:mm:ss');
};

export const toUTCDateTime = (dateTimeString) => {
  if (!dateTimeString) return null;
  
  const m = moment.isMoment(dateTimeString) ? dateTimeString : moment(dateTimeString);
  if (!m.isValid()) return null;
  
  return m.utc().format('YYYY-MM-DD HH:mm:ss');
};
