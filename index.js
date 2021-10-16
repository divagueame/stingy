import {initializeApp} from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js'
import {getFirestore, doc, collection, query, where, getDocs, addDoc} from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js'
import {getAuth, onAuthStateChanged,createUserWithEmailAndPassword, signInWithEmailAndPassword,signOut, GoogleAuthProvider, signInWithRedirect} from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js'

const firebaseConfig = {
  apiKey: "AIzaSyDFH-HvSyQ2nL2V0XWMV1dFyVrgna_HzBI",
  authDomain: "stingy-d49e9.firebaseapp.com",
  databaseURL: "https://stingy-d49e9-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "stingy-d49e9",
  storageBucket: "stingy-d49e9.appspot.com",
  messagingSenderId: "231992947759",
  appId: "1:231992947759:web:db2e29dd9249e36ff742da",
  measurementId: "G-ZKHW1F38FT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const auth = getAuth();

const registerForm = document.getElementById('registerForm')
const logoutbtn = document.getElementById('logout-btn')
const loggedInWrapper = document.getElementById('loggedInWrapper')
// const userInfoDiv = document.getElementById('userInfoDiv')
const currentBillsDiv = document.getElementById('currentBillsDiv')


registerForm.addEventListener('submit', function(e){
  e.preventDefault()
  let newUsername = document.getElementById('username').value
  let newPassword = document.getElementById('password').value
  
signInWithEmailAndPassword(auth, newUsername, newPassword)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    console.log("User in!")
    ;


  })
  .catch((error) => {
    console.log("User not found")
    console.log(newUsername, newPassword)
    createUserWithEmailAndPassword(auth, newUsername,newPassword).then((userCredential) => {
      // User signed in.
      console.log("Yes")
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("Cannot sign in",errorCode)
      console.log(errorMessage)
      // ..
    });
    const errorCode = error.code;
    const errorMessage = error.message;
  });
  
})



window.addEventListener('DOMContentLoaded', (event) => {
  onAuthStateChanged(auth, (user) => {
    console.log("State changed")
    if (user) {
      const uid = user.uid;
      registerForm.style.display = 'none'
      loggedInWrapper.style.display = 'block'
      
      let newbillbtn = document.createElement('button') 
      newbillbtn.innerHTML = 'Add new shared bill';
      newbillbtn.setAttribute('id', 'newbill-btn')
      loggedInWrapper.insertBefore(newbillbtn, loggedInWrapper.firstChild);
      // loggedInWrapper.appendChild(newbillbtn)


      let currentsharedbillsbtn = document.createElement('button') 
      currentsharedbillsbtn.innerHTML = 'Show current shared bills';
      currentsharedbillsbtn.setAttribute('id', 'currentsharedbills-btn')
      currentsharedbillsbtn.addEventListener('click', function(){
        getCurrentSharedBills(user)
      })
      // loggedInWrapper.appendChild(currentsharedbillsbtn)
      loggedInWrapper.insertBefore(currentsharedbillsbtn, loggedInWrapper.firstChild);
      
      userInfoDiv.innerHTML = user.email + " "  + user.uid
      
        
      newbillbtn.addEventListener('click', function(){
        addNewBill(user)
        getCurrentSharedBills(user)
      })

      logoutbtn.addEventListener('click', function(){
        console.log("Es")
            signOut(auth).then(() => {
              // Sign-out successful.
              console.log("USER IS LOGGED OUT")
            }).catch((error) => {
              // An error happened.
              console.log("COuldnt log out user")
            });
          })
      

    } else {  
      registerForm.style.display = 'block'
      loggedInWrapper.style.display = 'none'

      let newbillbtn = document.getElementById('newbill-btn')
      newbillbtn.parentElement.removeChild(newbillbtn)

      let currentsharedbillsbtn = document.getElementById('currentsharedbills-btn')
      currentsharedbillsbtn.parentElement.removeChild(currentsharedbillsbtn)

      currentBillsDiv.innerHTML = '';
      currentBillInfo.innerHTML = ''
    }
  })

} )


function addNewBill(user){
  // console.log("Add  New bill",user.uid)
  let thisUserId = user.uid
  console.log(thisUserId)
    const docRef = addDoc(collection(db, "bills"), {
    users: [user.uid],
    moves: [
      createPaymentObj(thisUserId,32),
      createPaymentObj(thisUserId,12),
      createPaymentObj(thisUserId,532),
      createPaymentObj(thisUserId,52),
      createPaymentObj(thisUserId,2),
    ]
  }).then((e)=>{
    // console.log("Document written with ID: ", docRef.id);
    // console.log("Document written with ID: ", e.id);
  })
  

}

function createPaymentObj(userId,payedAmmount){
  // console.log("Create")
  // console.log(userId)
  return {
    date: new Date(),
    user: userId,
    ammount: payedAmmount
  }
}

function getCurrentSharedBills(user){
  if(currentBillsDiv.innerHTML!=''){
    console.log(currentBillsDiv.children)
    currentBillsDiv.textContent = ''
  }
   let thisUserId = user.uid
  const q = query(collection(db, "bills"), where("users", "array-contains", thisUserId));
 
  getDocs(q).then((es)=>{
    es.forEach((doc) => {
      renderBill(doc.data())
      // console.log("AS",doc.data())
    });
    
  })
}


function renderBill(billsData){
  
  let thisBillUsers = billsData['users']

  let thisBillDiv = document.createElement('div')
  thisBillDiv.classList.add("billListItem")

  thisBillUsers.forEach((userName)=>{
    let usersDiv = document.createElement('div');
    usersDiv.innerHTML = userName
    thisBillDiv.appendChild(usersDiv)
  })
  currentBillsDiv.appendChild(thisBillDiv)

  thisBillDiv.addEventListener('click', function(){
    renderCurrentBillInfo(billsData)
  })
}

function renderCurrentBillInfo(bill){
  const currentBillInfo = document.getElementById('currentBillInfo')
  currentBillInfo.textContent = ""
  
  bill.moves.forEach((singleMove)=>{
    // console.log(singleMove,"as")
    let singleMoveDiv = renderSingleMoveDiv(singleMove)
    currentBillInfo.appendChild(singleMoveDiv)
  })

  let addUserBtn = document.createElement('button')
  addUserBtn.innerHTML = "Add a friend to this bill"
  currentBillInfo.appendChild(addUserBtn)

  addUserBtn.addEventListener('click', function(){
    let newEmail = 'mike@mike.com'
    retrieveUserId(newEmail)
  })


}

function renderSingleMoveDiv(move){
  let returnDiv = document.createElement('div')
  returnDiv.classList.add('singleMove')
  returnDiv.innerHTML = move['ammount']
  // returnDiv.innerHTML += move['user']
  return returnDiv
}



function retrieveUserId(email){
  console.log(email)
}