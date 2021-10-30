import {initializeApp} from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js"
import {getFirestore, doc, arrayUnion,setDoc, updateDoc, collection, query, where, getDoc, getDocs, addDoc} from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js"
import {getAuth, onAuthStateChanged,createUserWithEmailAndPassword, signInWithEmailAndPassword,signOut, GoogleAuthProvider, signInWithRedirect} from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js"


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
const logoutbtnWrapper = document.querySelector('.logout-btn-wrapper')
const loggedInWrapper = document.getElementById('loggedInWrapper')
const loggedOutWrapper = document.getElementById('loggedOutWrapper')
const menuDots = document.querySelector('.menu-dots');
const menuButtons = document.querySelector('.menu-buttons');

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

  })
  .catch((error) => {
    console.log("User not found. Creating a new account")
    console.log(newUsername, newPassword)
    createUserWithEmailAndPassword(auth, newUsername,newPassword).then((userCredential) => {
      // User signed in.
      // console.log("Yes", userCredential.user)
      dbAddNewUser(userCredential.user)
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("Cannot create new account",errorCode)
      console.log(errorMessage)
      // ..
    });
    const errorCode = error.code;
    const errorMessage = error.message;
  });
  
})



window.addEventListener('DOMContentLoaded', (event) => {
  onAuthStateChanged(auth, (user) => {
    //  User is logged in
    if (user) {
      const uid = user.uid;
      loggedOutWrapper.style.display = 'none'
      loggedInWrapper.style.display = 'flex'
      
      // const menuDots = document.querySelector('.menu-dots');
      menuButtons.style.display = 'none'
      menuDots.style.display = 'flex'

      window.addEventListener('click', function(e){
        // console.log(menuDots)
        if (((e.target).parentElement==menuDots)||((e.target)==menuDots)){ // Open menu
          menuDots.style.display = 'none'
          menuButtons.style.display = 'flex'
          menuButtons.classList.toggle('menu-buttons-mobile')
        }else { //Close menu
          menuDots.style.display = 'flex'
          menuButtons.style.display = 'none '
          menuButtons.classList.toggle('menu-buttons-mobile')
        }
      })
      

      let newbillbtn = document.createElement('button') 
      newbillbtn.innerHTML = 'Add new shared bill';
      newbillbtn.setAttribute('id', 'newbill-btn')
      // loggedInWrapper.insertBefore(newbillbtn, loggedInWrapper.firstChild);
      // loggedInWrapper.appendChild(newbillbtn)

      let currentsharedbillsbtn = document.createElement('button') 
      currentsharedbillsbtn.innerHTML = 'Show current shared bills';
      currentsharedbillsbtn.setAttribute('id', 'currentsharedbills-btn')
      currentsharedbillsbtn.addEventListener('click', function(){
        getCurrentSharedBills(user)
      })
      // loggedInWrapper.appendChild(currentsharedbillsbtn)
      // loggedInWrapper.insertBefore(currentsharedbillsbtn, loggedInWrapper.firstChild);
      // userInfoDiv.innerHTML = user.email + " "  + user.uid
      
      newbillbtn.addEventListener('click', function(){
        addNewBill(user)
        getCurrentSharedBills(user)
      })

      logoutbtnWrapper.addEventListener('click', (e)=>{
        signOut(auth).then(() => {
          // Sign-out successful.
          console.log("USER IS LOGGED OUT")
        }).catch((error) => {
          // An error happened.
          console.log("COuldnt log out user")
        });
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
      

    } else {   //User is logged out
      loggedOutWrapper.style.display = 'flex'
      loggedInWrapper.style.display = 'none'

      let newbillbtn = document.getElementById('newbill-btn')
      if(newbillbtn){
        // newbillbtn.parentElement.removeChild(newbillbtn)
      }
      

      
      let currentsharedbillsbtn = document.getElementById('currentsharedbills-btn')
      if(currentsharedbillsbtn){
        // currentsharedbillsbtn.parentElement.removeChild(currentsharedbillsbtn)
      }
      
      currentBillsDiv.innerHTML = '';
      currentBillInfo.innerHTML = ''
    }
  })
} )

function dbAddNewUser(user){
  let userArray = [user.uid,user.email]
  let userName = user.email.match(/^(.*?)\@/)
  const docRef = addDoc(collection(db, "users"), {
    'userInfo': userArray,
    'userName': userName[1]

  }).then((e)=>{
    console.log("Yes. Db user added", e)
  }).catch((f)=>{
    // console.log("No. Db user NOT added", f)
  })
}

function addNewBill(user){
  // console.log("Add  New bill",user.uid)
  let thisUserId = user.uid
  // console.log(thisUserId)
    const docRef = addDoc(collection(db, "bills"), {
    users: [user.uid],
    moves: [
      createPaymentObj(thisUserId,1,"Is"),
      // createPaymentObj(thisUserId,1,"Jess"),
      // createPaymentObj(thisUserId,1,"Jess"),
      createPaymentObj(thisUserId,121,"it"),
      createPaymentObj(thisUserId,51,"clear"),
      createPaymentObj(thisUserId,51,"now?"),
      // createPaymentObj(thisUserId,532,"Dinner at BurgerKing"),
      // createPaymentObj(thisUserId,52,"Beers"),
      // createPaymentObj(thisUserId,2,"Ride"),
    ]
  }).then((e)=>{
    // console.log("Document written with ID: ", docRef.id);
    // console.log("Document written with ID: ", e.id);
  })

}

function createPaymentObj(userId,payedAmmount,paymentConcept){
  // console.log("Create")
  // console.log(userId)
  return {
    date: new Date(),
    user: userId,
    ammount: payedAmmount,
    concept: paymentConcept
  }
}

function retrieveUserId(email){
  const q = query(collection(db, "users"), where("userInfo", "array-contains", email));
  return getDocs(q).then((es)=>{
    let found
    es.forEach((doc) => {
      found = doc.data()['userInfo'][0] 
      return found
    });
    return found
  })
}


function retrieveUserName(id){
  const q = query(collection(db, "users"), where("userInfo", "array-contains", id));
  return getDocs(q).then((es)=>{
    let found
    es.forEach((doc) => {
      // console.log("doc is: ", doc.data()['userName'])
      found = doc.data()['userName']
      return found
    });
    return found
  })
}


function getCurrentSharedBills(user){
  if(currentBillsDiv.innerHTML!=''){
    currentBillsDiv.textContent = ''
  }
   let thisUserId = user.uid
  const q = query(collection(db, "bills"), where("users", "array-contains", thisUserId));
 
  getDocs(q).then((es)=>{
    es.forEach((doc) => {
      renderBill(doc)
    });
    
  })
}


function renderBill(bill){
  // currentBillsDiv.textContent = ""
  // console.log("THIS",bill.id)
  let thisBillUsers = bill.data()['users']

  let thisBillDiv = document.createElement('div')
  thisBillDiv.classList.add("billListItem")

  thisBillUsers.forEach((userId)=>{
    let usersDiv = document.createElement('div');
    // retrieveUserName
    retrieveUserName(userId).then((userName)=>{
      
      usersDiv.innerHTML = userName
      // thisBillDiv.appendChild(usersDiv)
    })
    
    
  })
  // currentBillsDiv.appendChild(thisBillDiv)

  thisBillDiv.addEventListener('click', function(){
    renderCurrentBillInfo(bill)
  })
}

function renderCurrentBillInfo(bill){
  const currentBillInfo = document.getElementById('currentBillInfo')
  currentBillInfo.textContent = ""
  
  //Header
  let singleMoveDiv = renderBillHeader(bill)
  currentBillInfo.appendChild(singleMoveDiv)

  //Moves in this Bill
  bill.data().moves.forEach((singleMove)=>{
    let singleMoveDiv = renderSingleMoveDiv(singleMove)
    currentBillInfo.appendChild(singleMoveDiv)
  })

  //Add new move btn
  let addMoveBtn = document.createElement('button')
  addMoveBtn.innerHTML = "+"
  let newAmmountMove = 69
  let newConcept = "Good stuff"
  // currentBillInfo.appendChild(addMoveBtn)
  // addNewMove(bill,newAmmountMove, newConcept)
  
  
  //Add friend btn
  let addUserBtn = document.createElement('button')
  addUserBtn.innerHTML = "Add a friend to this bill"
  // currentBillInfo.appendChild(addUserBtn)

  addUserBtn.addEventListener('click', function(){
    toggleInputPanel()
  })
  

  // let newEmail = 'mike@mike.com'
  // retrieveUserId(newEmail)
  // .then((thisUserId)=>{
  //   // console.log("And we have this user id...", thisUserId)
  //   if (thisUserId!=undefined) {
  //     addUserBtn.addEventListener('click', function(){
  //       addNewUserToBill(thisUserId,bill)
  //      })
  //   }
   
  //   })
  // .catch((err)=>{
  //   alert(err.code, err.message)
  // })

    //Create hidden panel to add new user to a bill
    let newUserPanel = createNewPanel()
    // currentBillInfo.appendChild(newUserPanel)

}

function addNewUserToBill(newUserId,thisBill){
  let billRef = doc(db,"bills",thisBill.id)
  let newUsersArray = thisBill.data()['users']
  if(!newUsersArray.includes(newUserId)){
    newUsersArray.push(newUserId)  
  }
  setDoc(billRef, { 'users': newUsersArray }, { merge: true }); 
}

function renderBillHeader(bill){
  let returnDiv = document.createElement('div')
  returnDiv.classList.add("bill-header")
    let textDiv = document.createElement('div')
    textDiv.innerText = ''
    let dotsDiv = document.createElement('div')
    dotsDiv.classList.add("dots")
    // returnDiv.appendChild(textDiv)
    // returnDiv.appendChild(dotsDiv)
  return returnDiv
}

function renderSingleMoveDiv(move){
  let concept = move['concept']
  let ammount = move['ammount']

  let returnDiv = document.createElement('div')
  returnDiv.classList.add('singleMove')
  returnDiv.innerHTML = `${concept}, ${ammount}`
  // returnDiv.innerHTML += move['user']
  return returnDiv
}



function addNewMove(bill,ammount,paymentConcept){
  let userId = auth.currentUser.uid;
  let billRef = doc(db,"bills",bill.id)
  let movesArray = bill.data()['moves']
  let newMove = createPaymentObj(userId,ammount,paymentConcept)
  movesArray.push(newMove)

    
  setDoc(billRef, { 'moves': movesArray }, { merge: true }).then((e)=>{
    console.log("Yes")
  }).catch((err)=>{
    console.log(err)
    console.log("ERROR")
  })



}

function createNewPanel(){
  let panel = document.createElement('div')
  panel.classList.add('add-new-user-panel')
  panel.classList.add('hidden-panel')
  
  let emailInput = document.createElement('input')
  emailInput.classList.add('add-email-text-input')
  emailInput.setAttribute('type','text')
  // emailInput.autofocus = true
  // panel.appendChild(emailInput)
  return panel
}

function toggleInputPanel(){
  document.querySelector('.add-new-user-panel').classList.toggle('hidden-panel');
  document.querySelector('.add-email-text-input').focus()
}

