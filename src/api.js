const keys={data:'bdc_demo_data',user:'bdc_user'};
export const DEMO_ACCOUNTS={
 donor:{email:'donor@example.com',password:'Donor@1234',role:'donor',token:'demo-donor-token',user:{id:'DEMO-D001',fullName:'Aarav Sharma',name:'Aarav Sharma',email:'donor@example.com',mobile:'9876543210',phone:'9876543210',bloodGroup:'O+',city:'Phagwara',state:'Punjab',pinCode:'144401',gender:'Male',address:'Model Town, Phagwara',points:120,totalDonations:3}},
 hospital:{email:'apollo.delhi@bloodconnect.org',password:'Hospital@1234',role:'hospital',token:'demo-hospital-token',hospital:{id:'DEMO-H001',hospitalId:'DEMO-H001',name:'Apollo Lifeline Hospital',hospitalName:'Apollo Lifeline Hospital',email:'apollo.delhi@bloodconnect.org',contactNumber:'9876501234',address:'Sector 12, New Delhi',city:'New Delhi',state:'Delhi',pinCode:'110001',latitude:28.6139,longitude:77.2090,licenseNumber:'DL-BB-2026-0018',registrationNumber:'DL-BB-2026-0018',representativeName:'Dr. Kavita Rao',isVerified:true}},
 admin:{email:'admin@bloodconnect.org',password:'Admin@1234',role:'superadmin',token:'demo-admin-token',user:{id:'DEMO-A001',fullName:'Blood Connect Administrator',name:'Blood Connect Administrator',email:'admin@bloodconnect.org',role:'superadmin'}}
};
const hospitalsSeed=[
 {id:'H001',hospitalId:'H001',hospitalName:'Apollo Lifeline Hospital',name:'Apollo Lifeline Hospital',address:'Sector 12',city:'New Delhi',state:'Delhi',pinCode:'110001',pin_code:'110001',latitude:28.6139,longitude:77.2090,contactNumber:'9876501234',isVerified:true,isActive:true,updatedAt:new Date().toISOString(),bloodInventory:[{bloodGroup:'O+',availableUnits:18},{bloodGroup:'O-',availableUnits:4},{bloodGroup:'A+',availableUnits:12},{bloodGroup:'A-',availableUnits:5},{bloodGroup:'B+',availableUnits:9},{bloodGroup:'B-',availableUnits:3},{bloodGroup:'AB+',availableUnits:6},{bloodGroup:'AB-',availableUnits:2}]},
 {id:'H002',hospitalId:'H002',hospitalName:'City Care Hospital',name:'City Care Hospital',address:'Model Town',city:'Jalandhar',state:'Punjab',pinCode:'144003',pin_code:'144003',latitude:31.3260,longitude:75.5762,contactNumber:'9811122233',isVerified:true,isActive:true,updatedAt:new Date().toISOString(),bloodInventory:[{bloodGroup:'O+',availableUnits:12},{bloodGroup:'O-',availableUnits:2},{bloodGroup:'A+',availableUnits:8},{bloodGroup:'AB-',availableUnits:1}]},
 {id:'H003',hospitalId:'H003',hospitalName:'Civil Hospital Phagwara',name:'Civil Hospital Phagwara',address:'GT Road',city:'Phagwara',state:'Punjab',pinCode:'144401',pin_code:'144401',latitude:31.2240,longitude:75.7708,contactNumber:'9876112233',isVerified:true,isActive:true,updatedAt:new Date().toISOString(),bloodInventory:[{bloodGroup:'O+',availableUnits:7},{bloodGroup:'B+',availableUnits:5},{bloodGroup:'AB+',availableUnits:3}]},
 {id:'H004',hospitalId:'H004',hospitalName:'Fortis Memorial Research Institute',name:'Fortis Memorial Research Institute',address:'Sector 44',city:'Gurugram',state:'Haryana',pinCode:'122002',pin_code:'122002',latitude:28.4595,longitude:77.0266,contactNumber:'9876554321',isVerified:true,isActive:true,updatedAt:new Date().toISOString(),bloodInventory:[{bloodGroup:'O+',availableUnits:15},{bloodGroup:'A-',availableUnits:3},{bloodGroup:'B-',availableUnits:2}]}
];
const bloodGroups=['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const requestsSeed=[
 {id:'REQ-2408',patientName:'Riya Kapoor',bloodGroup:'O-',unitsNeeded:2,hospitalName:'City Care Hospital',treatmentLocation:'Jalandhar, Punjab',city:'Jalandhar',state:'Punjab',pinCode:'144003',emergencyLevel:'CRITICAL',requiredDate:new Date(Date.now()+86400000).toISOString().slice(0,10),status:'PENDING',contactNumber:'9812345678',additionalNotes:'Urgent need for scheduled surgery.'},
 {id:'REQ-2407',patientName:'Patient · A.K.',bloodGroup:'B+',unitsNeeded:1,hospitalName:'Apollo Lifeline Hospital',treatmentLocation:'New Delhi',city:'New Delhi',state:'Delhi',pinCode:'110001',emergencyLevel:'URGENT',requiredDate:new Date(Date.now()+2*86400000).toISOString().slice(0,10),status:'PENDING',contactNumber:'9812345600'},
 {id:'REQ-2406',patientName:'Patient · M.S.',bloodGroup:'AB-',unitsNeeded:3,hospitalName:'Civil Hospital Phagwara',treatmentLocation:'Phagwara, Punjab',city:'Phagwara',state:'Punjab',pinCode:'144401',emergencyLevel:'URGENT',requiredDate:new Date(Date.now()+86400000).toISOString().slice(0,10),status:'ACCEPTED',contactNumber:'9812345611'},
 {id:'REQ-2405',patientName:'Patient · R.P.',bloodGroup:'A+',unitsNeeded:2,hospitalName:'Fortis Memorial Research Institute',treatmentLocation:'Gurugram, Haryana',city:'Gurugram',state:'Haryana',pinCode:'122002',emergencyLevel:'NORMAL',requiredDate:new Date(Date.now()+4*86400000).toISOString().slice(0,10),status:'PENDING',contactNumber:'9812345622'},
 {id:'REQ-2404',patientName:'Patient · S.D.',bloodGroup:'O+',unitsNeeded:2,hospitalName:'Civil Hospital Phagwara',treatmentLocation:'Phagwara, Punjab',city:'Phagwara',state:'Punjab',pinCode:'144401',emergencyLevel:'URGENT',requiredDate:new Date(Date.now()+86400000).toISOString().slice(0,10),status:'PENDING',contactNumber:'9812345633',additionalNotes:'Sample local request for two O+ units.'}
];
const donorsSeed=[{id:'D001',fullName:'Aarav Sharma',name:'Aarav Sharma',email:'donor@example.com',mobile:'9876543210',bloodGroup:'O+',city:'Phagwara',state:'Punjab',pinCode:'144401',isEligible:true,lastDonationDate:'2026-05-12'},{id:'D002',fullName:'Simran Kaur',name:'Simran Kaur',bloodGroup:'B+',city:'Jalandhar',state:'Punjab',pinCode:'144003',isEligible:true,lastDonationDate:'2026-04-28'},{id:'D003',fullName:'Kabir Singh',name:'Kabir Singh',bloodGroup:'O-',city:'Ludhiana',state:'Punjab',pinCode:'141001',isEligible:true,lastDonationDate:'2026-03-10'},{id:'D004',fullName:'Meera Patel',name:'Meera Patel',bloodGroup:'AB+',city:'New Delhi',state:'Delhi',pinCode:'110001',isEligible:false,lastDonationDate:'2026-06-02'}];
const defaultState=()=>({hospitals:hospitalsSeed,requests:requestsSeed,donors:donorsSeed,notifications:[{id:'N001',title:'Donation reminder',message:'You may be eligible to donate again soon.',createdAt:new Date().toISOString(),isRead:false},{id:'N002',title:'New matching request',message:'A nearby patient needs O+ blood.',createdAt:new Date().toISOString(),isRead:false}],donations:[{id:'DN101',donation_date:'12 May 2026',hospital_name:'City Care Hospital',hospital_location:'Jalandhar, Punjab',blood_group:'O+',units:1,status:'VERIFIED',certificate_id:'BD-2026-0101',donor_name:'Aarav Sharma',verified_by:'Dr. Meera Shah',issued_at:'2026-05-12T10:30:00.000Z',qr_token:'BDC-DEMO-BD-2026-0101'},{id:'DN084',donation_date:'08 Jan 2026',hospital_name:'Civil Hospital Phagwara',hospital_location:'Phagwara, Punjab',blood_group:'O+',units:1,status:'VERIFIED',certificate_id:'BD-2026-0084',donor_name:'Aarav Sharma',verified_by:'Dr. Arjun Gill',issued_at:'2026-01-08T11:15:00.000Z',qr_token:'BDC-DEMO-BD-2026-0084'},{id:'DN059',donation_date:'22 Sep 2025',hospital_name:'City Care Hospital',hospital_location:'Jalandhar, Punjab',blood_group:'O+',units:1,status:'VERIFIED',certificate_id:'BD-2025-0059',donor_name:'Aarav Sharma',verified_by:'Dr. Meera Shah',issued_at:'2025-09-22T09:45:00.000Z',qr_token:'BDC-DEMO-BD-2025-0059'}],inventory:hospitalsSeed[0].bloodInventory.map((x,index)=>({blood_group:x.bloodGroup,available_units:x.availableUnits,reserved_units:[2,1,2,1,1,1,1,1][index],expired_units:[1,1,1,1,1,1,1,1][index]})),auditLogs:[{id:'A01',action:'Hospital verified',createdAt:new Date().toISOString(),actor:'Administrator'},{id:'A02',action:'Inventory updated',createdAt:new Date().toISOString(),actor:'Apollo Lifeline Hospital'}],points:120});
function read(){
 const defaults=defaultState();
 try{
  const saved=JSON.parse(localStorage.getItem(keys.data)||'{}');
  const state={...defaults,...saved};
  const stock=Array.isArray(saved.inventory)&&saved.inventory.length?saved.inventory:defaults.inventory;
  state.inventory=defaults.inventory.map((sample)=>{
   const item=stock.find(entry=>(entry.blood_group||entry.bloodGroup)===sample.blood_group)||sample;
   return {...sample,...item,
    available_units:Number(item.available_units??item.availableUnits)||sample.available_units,
    reserved_units:Number(item.reserved_units??item.reservedUnits)||sample.reserved_units,
    expired_units:Number(item.expired_units??item.expiredUnits)||sample.expired_units
   };
  });
  const requests=[...defaults.requests];
  if(Array.isArray(saved.requests)) saved.requests.forEach((item)=>{
   const existingIndex=requests.findIndex(entry=>entry.id===item.id);
   if(existingIndex>=0) requests[existingIndex]={...requests[existingIndex],...item};
   else requests.push(item);
  });
  state.requests=requests.map((item,index)=>{
   const sample=requestsSeed.find(entry=>entry.id===item.id)||requestsSeed[index%requestsSeed.length];
   return {...sample,...item,
    patientName:item.patientName||item.patient_name||sample.patientName,
    bloodGroup:item.bloodGroup||item.blood_group||sample.bloodGroup,
    unitsNeeded:Number(item.unitsNeeded??item.units_needed??item.required_units??item.units??sample.unitsNeeded),
    hospitalName:item.hospitalName||item.hospital_name||sample.hospitalName,
    treatmentLocation:item.treatmentLocation||item.treatment_location||item.location||sample.treatmentLocation,
    city:item.city||sample.city,state:item.state||sample.state,
    pinCode:item.pinCode||item.pin_code||sample.pinCode,
    contactNumber:item.contactNumber||item.contact_number||sample.contactNumber,
    requiredDate:item.requiredDate||item.required_date||sample.requiredDate,
    emergencyLevel:item.emergencyLevel||item.emergency_level||item.urgency||sample.emergencyLevel
   };
  });
  const donations=Array.isArray(saved.donations)&&saved.donations.length?saved.donations:defaults.donations;
  state.donations=donations.map((item,index)=>{
   const sample=defaults.donations.find(entry=>entry.certificate_id===item.certificate_id)||defaults.donations[index%defaults.donations.length];
   const donationDate=item.donation_date||item.donationDate||sample.donation_date;
   return {...sample,...item,donation_date:donationDate,
    hospital_name:item.hospital_name||item.hospitalName||sample.hospital_name,
    hospital_location:item.hospital_location||item.hospitalLocation||sample.hospital_location,
    blood_group:item.blood_group||item.bloodGroup||sample.blood_group,
    units:Number(item.units||item.unitCount||sample.units||1),
    status:item.status||'VERIFIED',certificate_id:item.certificate_id||item.certificateId||sample.certificate_id,
    donor_name:item.donor_name||item.donorName||'Aarav Sharma',
    verified_by:item.verified_by||item.verifiedBy||sample.verified_by,
    issued_at:item.issued_at||item.issuedAt||sample.issued_at,
    donor_mobile:item.donor_mobile||item.donorPhone||'9876543210',
    qr_token:item.qr_token||item.qrToken||sample.qr_token
   };
  });
  return state;
 }catch{return defaults}
}
function write(s){localStorage.setItem(keys.data,JSON.stringify(s));return s}
const response=data=>Promise.resolve({data});
const person=()=>{try{return JSON.parse(localStorage.getItem(keys.user)||'null')}catch{return null}};
function loginAccount(role){const a=DEMO_ACCOUNTS[role];return {token:a.token,user:a.user||a.hospital,hospital:a.hospital,role:a.role,type:role==='admin'?'admin':role==='hospital'?'hospital':'user'}}
const authAPI={
 registerUser:async data=>{const u={...DEMO_ACCOUNTS.donor.user,...data};return response({token:'demo-donor-token',user:u,role:'donor',type:'user'})},
 loginUser:async ({identifier='',email='',password=''})=>{const id=String(identifier||email).toLowerCase();const role=id===DEMO_ACCOUNTS.admin.email?'admin':'donor';const a=DEMO_ACCOUNTS[role];if(password!==a.password)throw {response:{data:{error:'Use the sample credentials shown on this page.'}}};const r=loginAccount(role);return response({token:r.token,user:r.user,role:r.role,type:r.type})},
 registerHospital:async d=>response({token:'demo-hospital-token',hospital:{...DEMO_ACCOUNTS.hospital.hospital,...d},role:'hospital'}),
 loginHospital:async ({email,password})=>{if(email.toLowerCase()!==DEMO_ACCOUNTS.hospital.email||password!==DEMO_ACCOUNTS.hospital.password)throw {response:{data:{error:'Use the sample hospital credentials shown on this page.'}}};const r=loginAccount('hospital');return response(r)},
 loginAdmin:async ({email,password})=>{if(email!==DEMO_ACCOUNTS.admin.email||password!==DEMO_ACCOUNTS.admin.password)throw {response:{data:{error:'Invalid demo admin credentials.'}}};return response(loginAccount('admin'))},
 getProfile:async()=>{const u=person();return response({type:u?.role==='hospital'?'hospital':u?.role==='superadmin'?'admin':'user',user:u,hospital:u,admin:u})},
 updateProfile:async d=>{const u={...person(),...d};localStorage.setItem(keys.user,JSON.stringify(u));return response({user:u})}
};
const inventoryAPI={
 searchBlood:async params=>{const s=read();let hs=s.hospitals.filter(h=>h.isActive!==false&&h.isVerified!==false).map(h=>{const stock=(h.id==='H001'?s.inventory:h.bloodInventory||[]).map(x=>({bloodGroup:x.bloodGroup||x.blood_group,availableUnits:Number(x.availableUnits??x.available_units??0)}));return {...h,distanceKm:Math.max(1,Math.round(Math.abs(Number(params.pinCode||'110001')-Number(h.pinCode||'110001'))/100+3)),bloodStock:stock}});if(params.bloodGroup)hs=hs.filter(h=>h.bloodStock.some(x=>x.bloodGroup===params.bloodGroup&&x.availableUnits>0));return response({hospitals:hs})},
 getMyInventory:async()=>{const s=read();return response({inventory:bloodGroups.map(g=>s.inventory.find(x=>(x.blood_group||x.bloodGroup)===g)||{blood_group:g,available_units:6,reserved_units:1,expired_units:1}),history:[{id:'I1',blood_group:'O+',previous_units:16,new_units:18,available_units:18,created_at:new Date().toISOString(),notes:'Sample stock check'}],reminder:{frequencyHours:24,lastUpdatedAt:new Date().toISOString(),reminder_status:'UP_TO_DATE'}})},
 updateItem:async d=>{const s=read();s.inventory=s.inventory.map(x=>(x.blood_group||x.bloodGroup)===d.bloodGroup?{...x,available_units:d.availableUnits,reserved_units:d.reservedUnits,expired_units:d.expiredUnits}:x);write(s);return response({success:true})},
 batchUpdate:async d=>{const s=read(),items=Array.isArray(d)?d:(d.items||[]);for(const item of items)s.inventory=s.inventory.map(x=>(x.blood_group||x.bloodGroup)===(item.bloodGroup||item.blood_group)?{...x,available_units:item.availableUnits??item.available_units,reserved_units:item.reservedUnits??item.reserved_units,expired_units:item.expiredUnits??item.expired_units}:x);write(s);return response({success:true})}
};
const requestAPI={
 getPublicRequests:async params=>{let list=read().requests;if(params?.bloodGroup)list=list.filter(x=>x.bloodGroup===params.bloodGroup);if(params?.emergencyLevel)list=list.filter(x=>x.emergencyLevel===params.emergencyLevel);return response({requests:params?.limit?list.slice(0,params.limit):list})},
 createRequest:async d=>{const s=read();s.requests.unshift({id:`REQ-${Date.now().toString().slice(-5)}`,status:'PENDING',...d});write(s);return response({success:true})},
 getMyRequests:async()=>response({requests:read().requests}),getHospitalRequests:async()=>response({requests:read().requests}),
 updateStatus:async(id,d)=>{const s=read();s.requests=s.requests.map(x=>String(x.id)===String(id)?{...x,status:d.status}:x);write(s);return response({success:true})}
};
const donorAPI={
 getDashboard:async()=>{const s=read();const u=person()||DEMO_ACCOUNTS.donor.user;return response({profile:{...DEMO_ACCOUNTS.donor.user,...u},stats:{totalDonations:s.donations.length,verifiedDonations:s.donations.length,totalPoints:s.points,donorLevel:'Silver Lifesaver',progressPercent:60,nextLevel:'Gold Lifesaver',pointsToNextLevel:80,lastDonationDate:'12 May 2026',isEligibleNow:true,eligibilityReminderEnabled:true,nextEligibleDate:'10 Aug 2026',eligibility:{wholeBlood:{progressPercent:76},plateletApheresis:{progressPercent:42}}},recentDonations:s.donations.slice(0,3),rewards:[{id:'BADGE-001',title:'Community Lifesaver',description:'Awarded for making three verified blood donations.',points:100}],certificates:s.donations.map(d=>({id:d.certificate_id,certificate_id:d.certificate_id,hospital_name:d.hospital_name})),matchingRequests:s.requests.filter(r=>r.status==='PENDING'&&(r.bloodGroup||r.blood_group)===(u.bloodGroup||'O+')).slice(0,3).map(r=>({id:r.id,patient_name:r.patientName||r.patient_name,hospital_name:r.hospitalName||r.hospital_name,pin_code:r.pinCode||r.pin_code,units_needed:r.unitsNeeded||r.units_needed||r.required_units||1}))})},
 getHistory:async()=>response({donations:read().donations}),getPointsAndRewards:async()=>{const s=read();return response({userPoints:{totalPoints:s.points,history:[{date:'2026-05-12',description:'Verified donation',points:40},{date:'2026-01-08',description:'Verified donation',points:40}],nextRewardAt:160},leaderboard:[{name:'Aarav Sharma',points:s.points,rank:1},{name:'Simran Kaur',points:95,rank:2}]})},
 toggleReminderPreference:async enabled=>response({enabled}),triggerTestReminder:async()=>{const s=read();s.notifications.unshift({id:`N${Date.now()}`,title:'Eligibility reminder',message:'This is a sample reminder.',createdAt:new Date().toISOString(),isRead:false});write(s);return response({success:true})}
};
const hospitalAPI={
 getPublicList:async()=>response({hospitals:read().hospitals}),
 getDashboardStats:async()=>{const s=read(),units=s.inventory.reduce((a,x)=>a+Number(x.available_units||0),0);return response({summary:{hospitalName:'Apollo Lifeline Hospital',totalAvailable:units,totalReserved:10,totalExpired:8,pendingRequestsCount:s.requests.filter(x=>x.status==='PENDING').length,hoursSinceUpdate:2,isOverdue:false},bloodGroups:s.inventory.map(x=>({...x})),recentDonations:s.donations.slice(0,3),recentRequests:s.requests.slice(0,4),reminderInfo:{frequencyHours:24,reminder_status:'UP_TO_DATE'}})},
 updateAddress:async d=>response({success:true,address:d}),updateReminderFrequency:async d=>response({success:true,...d}),
 verifyDonation:async d=>{const s=read(),id=`BD-2026-${Date.now().toString().slice(-4)}`;const donation={id:`DN${Date.now()}`,donation_date:new Date().toLocaleDateString('en-IN'),hospital_name:'Apollo Lifeline Hospital',hospital_location:'New Delhi, Delhi',blood_group:d.bloodGroup||d.blood_group||'O+',units:Number(d.units||1),status:'VERIFIED',certificate_id:id,donor_name:'Aarav Sharma',donor_mobile:'9876543210',verified_by:'Dr. Kavita Rao',issued_at:new Date().toISOString(),qr_token:`BDC-DEMO-${id}`};s.donations.unshift(donation);s.points+=40;write(s);return response({success:true,certificateId:id,donation})}
};
const certificateAPI={getMyCertificates:async()=>response({certificates:read().donations.map(d=>({id:d.certificate_id,certificateNumber:d.certificate_id,donationDate:d.donation_date,hospitalName:d.hospital_name,hospitalLocation:d.hospital_location,bloodGroup:d.blood_group,donorName:d.donor_name,units:d.units,issuedAt:d.issued_at,qrToken:d.qr_token,status:d.status}))}),verifyCertificate:async id=>{const d=read().donations.find(x=>x.certificate_id===id);return response({isValid:!!d,message:d?'Certificate verified in demo':'Certificate not found',certificate:d?{...d,certificateNumber:d.certificate_id,donorName:d.donor_name}:null})}};
const adminAPI={
 getStats:async()=>{const s=read();return response({totalDonors:1420,verifiedHospitals:s.hospitals.length,totalHospitals:s.hospitals.length,totalAvailableUnits:s.inventory.reduce((a,x)=>a+Number(x.available_units||0),0),totalDonations:s.donations.length+917,openRequests:s.requests.filter(x=>x.status==='PENDING').length,activeRequests:s.requests.filter(x=>x.status==='PENDING').length,overdueHospitalsCount:1,pendingVerificationCount:s.hospitals.filter(h=>!h.isVerified).length})},
 getHospitals:async()=>response({hospitals:read().hospitals}),getUsers:async()=>response({users:read().donors}),getAuditLogs:async()=>response({logs:read().auditLogs}),
 approveHospital:async(id)=>{const s=read();s.hospitals=s.hospitals.map(x=>x.id===id?{...x,isVerified:true}:x);write(s);return response({success:true})},toggleHospitalStatus:async(id,d)=>{const s=read();s.hospitals=s.hospitals.map(x=>x.id===id?{...x,isActive:d.isActive}:x);write(s);return response({success:true})},triggerReminderCheck:async()=>response({processedCount:read().hospitals.length})
};
const notificationAPI={getNotifications:async()=>{const ns=read().notifications.map(n=>({...n,is_read:n.isRead}));return response({notifications:ns,unreadCount:ns.filter(n=>!n.is_read).length})},markAsRead:async id=>{const s=read();s.notifications=s.notifications.map(n=>n.id===id?{...n,isRead:true,is_read:true}:n);write(s);return response({success:true})}};
const reportAPI={
 getUserReport:async()=>{const s=read(),profile=DEMO_ACCOUNTS.donor.user;return response({profile:{...profile,full_name:profile.fullName,blood_group:profile.bloodGroup,created_at:'2024-02-14T09:00:00.000Z'},summary:{verifiedDonationsCount:s.donations.length,totalDonations:s.donations.length,lifetimeTotalPoints:s.points,totalPoints:s.points,livesImpacted:s.donations.length*3},donations:s.donations.map(d=>({id:d.id,date:d.donation_date,hospitalName:d.hospital_name,hospitalCity:d.hospital_location,bloodGroup:d.blood_group,units:d.units,status:d.status,verifiedBy:d.verified_by,certificateId:d.certificate_id})),bloodGroupBreakdown:[{name:'O+',value:s.donations.length}],monthlyActivity:[{month:'Jan',donations:1},{month:'May',donations:2}]})},
 getHospitalReport:async()=>{const s=read(),available=s.inventory.reduce((a,x)=>a+Number(x.available_units||0),0),reserved=s.inventory.reduce((a,x)=>a+Number(x.reserved_units||0),0),expired=s.inventory.reduce((a,x)=>a+Number(x.expired_units||0),0),fulfilled=s.requests.filter(x=>x.status==='ACCEPTED').length;return response({hospital:DEMO_ACCOUNTS.hospital.hospital,summary:{totalRequests:s.requests.length,fulfilledRequests:fulfilled,verifiedDonationsCount:s.donations.length},stockTotals:{available,reserved,expired},requestMetrics:{totalReceived:s.requests.length,fulfilled,fulfillmentRate:Math.round(fulfilled/s.requests.length*100)},bloodStock:s.inventory.map(x=>({blood_group:x.blood_group,available_units:x.available_units,reserved_units:x.reserved_units,expired_units:x.expired_units,status:'AVAILABLE',last_updated:new Date().toISOString()}))})},downloadCsvUrl:'#'
};
export {authAPI,inventoryAPI,hospitalAPI,requestAPI,donorAPI,certificateAPI,reportAPI,adminAPI,notificationAPI};
export default {get:async()=>response({}),post:async()=>response({success:true}),put:async()=>response({success:true})};
