console.log('OKOKOK')
const groupsTable = document.querySelector('#myGroups')

groupsTable.addEventListener('click', (e)=>{
    // console.log(e.target.closest('tr').dataset.groupid)
    const groupId = e.target.closest('tr').dataset.groupid
    window.location.href = `/groups/${groupId}`

})
  