const BASE_URL = import.meta.env.VITE_BASE_URL || window.location.origin;

export function getMeetingLink(meetingCode) {
  if (
    meetingCode === undefined ||
    meetingCode === null ||
    meetingCode === 'undefined' ||
    meetingCode === 'null' ||
    meetingCode === '' ||
    typeof meetingCode !== 'string' ||
    meetingCode.trim().length === 0
  ) {
    return '';
  }
  return `${BASE_URL}/meeting/${meetingCode.trim()}`;
}

export function getInvitationText(meetingTitle, meetingCode) {
  const link = getMeetingLink(meetingCode);
  if (!link) return '';
  return `\u{1F680} SkillBridge Meeting Invitation\n\nMeeting: ${meetingTitle || 'SkillBridge Meeting'}\n\nJoin Here:\n${link}`;
}

export function getWhatsAppShareUrl(meetingTitle, meetingCode) {
  const message = getInvitationText(meetingTitle, meetingCode);
  if (!message) return '#';
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function getTelegramShareUrl(meetingTitle, meetingCode) {
  const message = getInvitationText(meetingTitle, meetingCode);
  if (!message) return '#';
  return `https://t.me/share/url?url=${encodeURIComponent(getMeetingLink(meetingCode))}&text=${encodeURIComponent(message)}`;
}

export function getEmailShareUrl(meetingTitle, meetingCode) {
  const link = getMeetingLink(meetingCode);
  const subject = encodeURIComponent(`Invitation: ${meetingTitle || 'SkillBridge Meeting'}`);
  const body = encodeURIComponent(
    `\u{1F680} SkillBridge Meeting Invitation\n\nMeeting: ${meetingTitle || 'SkillBridge Meeting'}\n\nJoin Here:\n${link}`
  );
  return `mailto:?subject=${subject}&body=${body}`;
}

export function copyMeetingLink(meetingCode) {
  const link = getMeetingLink(meetingCode);
  if (!link) return Promise.reject(new Error('No meeting code'));
  return navigator.clipboard.writeText(link);
}

export function copyInvitationText(meetingTitle, meetingCode) {
  const text = getInvitationText(meetingTitle, meetingCode);
  if (!text) return Promise.reject(new Error('No meeting code'));
  return navigator.clipboard.writeText(text);
}
