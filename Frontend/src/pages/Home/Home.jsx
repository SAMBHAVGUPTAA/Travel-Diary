import React, { useEffect, useState } from 'react'
import NavBar from '../../component/NavBar'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import TravelStoryCard from '../../component/Cards/TravelStoryCard';
import {MdAdd} from 'react-icons/md'
import Modal from 'react-modal'

import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddEditTravelStory from './AddEditTravelStory';
import ViewTravelStory from './ViewTravelStory';
import EmptyCard from '../../component/Cards/EmptyCard';

import EmptyImg from "../../assets/images/add-story.svg"
import { DayPicker } from 'react-day-picker';
import moment from 'moment';

const Home = () => {

  const navigate = useNavigate()

  const [userInfo, setUserInfo] = useState(null);
  const [allStories, setAllStories] = useState("");
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('')
  const [dateRange, setDateRange] = useState({from:null ,to: null})



  const [openAddEditModal, setOpenAddEditModal]=useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [openViewModal, setOpenViewModal] = useState({
    isShown: false,
    data: null,
  });

  // User Info get 
  const getUserInfo = async () => {
    try {

      const response = await axiosInstance.get('/get-user');
      if (response.data && response.data.user) {
        // set user info if data exist
        setUserInfo(response.data.user)
      }
    } catch (error) {
      if (error.response.status === 401) {
        // clear storage if unauthorized
        localStorage.clear();
        navigate("/login")
      }
    }
  };

  // get all stories
  const getAllTravelStories = async () => {
    try {
      const response = await axiosInstance.get("/get-all-stories");
      if (response.data && response.data.stories) {
        setAllStories(response.data.stories);
      }
    } catch (error) {
      console.log("An unexpected error occured. Please try again!")
    }
  }

  //handle edit story click 
  const handleEdit = (data) =>{
    setOpenAddEditModal({ isShown: true, type: "edit", data:data});
  }

  // handle travel story click 
  const handleViewStory = (data) =>{
    setOpenViewModal({isShown: true, data});
  }

  // handle update favourite
  const updateIsFavourite = async (storyData) =>{
    const storyId = storyData._id;

    try {
      const response = await axiosInstance.put("/update-is-favourite/" + storyId,{
        isFavourite: !storyData.isFavourite
      }
    );
    if (response.data && response.data.story){
      getAllTravelStories();
      toast.success("Story Updated successfully")
    }
    } catch (error) {
      console.log("An unexpected error occured. Please try again.")
      console.log(error.message)
    }
  }

  // delete story
  const deleteTravelStory = async (data) =>{
    const storyId = data._id;

    try {
      const response = await axiosInstance.delete("/delete-story/" + storyId);

      if(response.data && !response.data.error){
        toast.error("story deleted successfully");
        setOpenViewModal((prevState)=> ({...prevState, isShown: false}));
        getAllTravelStories();
      }
    } catch (error) {
      console.log(error)
    }
  }

  //search Story 
  const onSearchStory = async(query)=>{
    try {
      const response= await axiosInstance.get("/search",{
        params: {
          query,
        }
      });
      if(response.data && response.data.stories){
        setFilterType("search")
        setAllStories(response.data.stories)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleClearSearch=() =>{
    setFilterType("");
    getAllTravelStories();
  }

  // handle filter travel stroy by date
  const filterStoriesByDate = async (day) =>{
    try {
      const startDate = day.from ? moment(day.from).valueOf: null;
    const endDate = day.to ? moment(day.to).valueOf: null;

    if(startDate && endDate){
      const response = await axiosInstance.get("/travel-stories/filter",{
        params: {
          startDate,
          endDate
        },
      });
      if(response.data && response.data.stories){
        setFilterType("date")
        setAllStories(response.data.stories);
      }
    }
    } catch (error) {
      console.log(error)
    }
  };


  //handle date range select 
  const handleDayClick= (day)=>{
    setDateRange(day)
    filterStoriesByDate(day);
  }
  useEffect(() => {
    getAllTravelStories();
    getUserInfo();
    return () => {};
  }, []);


  return (
    <>
      <NavBar 
      userInfo={userInfo} 
      searchQuery={searchQuery} 
      setSearchQuery={setSearchQuery}
      onSearchNote={onSearchStory}
      handleClearSearch={handleClearSearch}
      />

      <div className='container mx-auto py-10'>
        <div className='flex gap-7'>
          <div className='flex-1'>
            {allStories.length > 0 ? (
              <div className='grid grid-cols-2 gap-4'>
                {allStories.map((item)=>{
                  return (
                    <TravelStoryCard
                    key={item._id}
                    imgUrl={item.imageUrl}
                    title={item.title}
                    story={item.story}
                    date={item.visitedDate}
                    visitedLocation={item.visitedLocation}
                    isFavourite={item.isFavourite}
                    handleClick={()=>handleViewStory(item)}
                    onFavouriteClick={()=> updateIsFavourite(item)}
                    />
                  );
                })}
              </div>
                ) : (
                  <EmptyCard 
                  imgSrc={EmptyImg}
                  message={`Start creating your first travel story! Click the 'ADD' button to jot down your thoughts, ideas and memories. lets get started`} />
            )}
          </div>

          <div className='w-[350px]'>
            <div className='bg-white border border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg'>
            <div className='p-3'>
              <DayPicker
              captionLayout='dropdown-buttons'
              mode="range"
              selected={dateRange}
              onSelect= {handleDayClick}
              pagedNavigation
              />
            </div>
            </div>
          </div>
        </div>
      </div>

      {/*Add and edit travel story model*/ }
      <Modal 
      isOpen={openAddEditModal.isShown}
      onRequestClose={()=>{}}
      style={{
        overlay: {
          backgroundColor: 'rgba(0,0,0,0.2)',
          zIndex: 999,
        }
      }}
      appElement= {document.getElementById("root")}
      className="model-box"
      >
        <AddEditTravelStory 
        type={openAddEditModal.type}
        storyInfo={openAddEditModal.type}
        onClose={()=>{
          setOpenAddEditModal({isShown:false, type: 'add', data: null});
        }}
        getAllTravelStories={getAllTravelStories} 
        />
      </Modal>

      {/*view travel story model*/ }
      <Modal 
      isOpen={openViewModal.isShown}
      onRequestClose={()=>{}}
      style={{
        overlay: {
          backgroundColor: 'rgba(0,0,0,0.2)',
          zIndex: 999,
        }
      }}
      appElement= {document.getElementById("root")}
      className="model-box"
      >

        <ViewTravelStory
        storyInfo={openViewModal.data|| null}
        onClose={()=>{
          setOpenViewModal((prevState) => ({...prevState, isShown:false}));
        }}
        onEditClick={()=>{
          setOpenViewModal((prevState) => ({...prevState, isShown:false}));
          handleEdit(openViewModal.data || null)
        }}
        onDeleteClick={()=>{
          deleteTravelStory (openViewModal.data || null);
        }}
        />
      </Modal>
      <button 
      className='w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-10'
      onClick={()=>{setOpenAddEditModal({isShown:true, type: "add", data: null});
    }}
    >
      <MdAdd className="text-[32px] text-white" />
    </button>

      <ToastContainer />
    </>
  )
}

export default Home
