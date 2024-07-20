"use client"
import Image from "next/image";
import bgDesktopDark from "@/assets/images/bg-desktop-dark.jpg";
import bgMobiledark from "@/assets/images/bg-mobile-dark.jpg";
import { AiOutlineEnter } from "react-icons/ai";
import axios from "axios";
import { useState,useEffect } from "react";
import Modal from "react-modal";



export default function Home() {
  interface Todo {
    id: number; // 假设 id 是 number 类型
    name: string;
    description: string;
    is_completed: boolean;
    created_at: string;
    updated_at: string;
    data:[];
    // 可根据实际情况添加其他属性
  }
  const [todos,setTodos] = useState<Todo[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const perPage = 10;
  const [updatedTime, setUpdatedTime] = useState('');
  
  //取得元todos清單
  const getTodo = async (page: number) => {
    try {
      const response = await axios.get<{ data: Todo[] }>(`https://wayi.league-funny.com/api/task?page=${page}`);
      const res = response.data.data;
      setTodos(res);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError("讀取錯誤");
    }
  };

  // 初始加载时获取 todos 列表
  useEffect(() => {
    getTodo(currentPage);
  }, [currentPage]);

  //新增todos清單
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("任務名稱為必填");
      return;
    }

    try {
      if (editingTodo) {
        const updatedTodo = {
          id: editingTodo.id,
          name,
          description,
          is_completed: editingTodo.is_completed,
        };

        await axios.put(
          `https://wayi.league-funny.com/api/task/${editingTodo.id}`,
          updatedTodo
        );

        // 清空表單和錯誤
        setName("");
        setDescription("");
        setError("");

        // 重新載入資料
        setUpdatedTime(new Date().toLocaleString());
        getTodo(currentPage);
        setEditModalOpen(false);
        setEditingTodo(null);
      } else {
        // 如果 editingTodo 為 null，表示需要創建新資料
        const newTask = {
          name,
          description,
          is_completed: false, // 默认为未完成
        };

        const response = await axios.post(
          "https://wayi.league-funny.com/api/task",
          newTask
        );

        // 清空表單和錯誤
        setName("");
        setDescription("");
        setError("");

        // 重新載入資料
        getTodo(currentPage);
      }
    } catch (error) {
      console.error("操作失敗:", error);
      setError("操作失敗，請重試");
    }
  };

  //關閉modal
  const handelCloseModal = () =>{
    setEditModalOpen(false);
  }

  //編輯todo
  
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setName(todo.name);
    setDescription(todo.description);
    setEditModalOpen(true);
  };



  //刪除功能
  const handleDelete = async(id:number) => {
    try {
      const response = await axios.delete(`https://wayi.league-funny.com/api/task/${id}`)
      console.log(response)
      const updatedTodos = todos.filter(todo => todo.id !== id);
      setTodos(updatedTodos);
    } catch (error) {
      console.error('刪除失敗:', error);
      setError("操作失敗，請重試");
    }
  }

  //切換顯示隱藏已完成or打開

  //隱藏
  const handleHideCompleted = () => {
    const filteredTodos = todos.filter(todo => !todo.is_completed);
    setTodos(filteredTodos);
  }

  //顯示
  const handleDisplayCompleted = () => {
    getTodo(currentPage);
  }
  
  //切換已完成、未完成狀態
  const [completed,setCompleted] = useState(false)
  const handleChangeTodoStatus = async(id:number,is_completed:boolean,updated_at:string) => {
    try {
      const response = await axios.patch(`https://wayi.league-funny.com/api/task/${id}`,{
        is_completed: !is_completed,
        updated_at: new Date().toLocaleString(), // 更新時間
      })
      console.log(response)
      setUpdatedTime(new Date().toLocaleString()); // 更新 updatedTime
      if(is_completed !== true) setCompleted(true);
      else setCompleted(false);
      getTodo(currentPage);
    } catch (error) {
      console.error('更新失敗:', error);
      setError("操作失敗，請重試");
    }
  }
  useEffect(() => {

  }, [updatedTime]);

  //換頁功能
  
  const handleNextPage = () => {
    setCurrentPage(prevPage => prevPage + 1);
  }
  
  const handlePrevPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1)); // 確保頁碼不小於1
  }

  
  
  
  return (
    <div className="relative w-full  px-4 ">
      <div className="w-full absolute top-0 left-0 -z-10 bg-blue-700 h-screen">
        {/* <Image className="w-full" src={bgDesktopDark} alt="bg-desktop" /> */}
      </div>
      <main className="flex flex-col gap-6 w-full max-w-[900px]  mx-auto">
        {/* header */}
        <div className="flex w-full justify-between items-center pt-20">
          <h2 className="text-white text-4xl font-black tracking-[10px] ">
            TODO
          </h2>
        </div>
        <section className="w-full flex-col flex gap-5  ">
          {/* input */}
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center mb-4">
              <label htmlFor="taskName" className="font-bold text-white text-2xl">任務名稱：</label>
              <input
                type="text"
                id="taskName"
                className="border-solid border-gray-600"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex justify-center mb-4">
              <label htmlFor="taskDescription" className="font-bold text-white text-2xl">任務描述：</label>
              <input
                type="text"
                id="taskDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {error && <p style={{ color: 'red' }} className="flex justify-center mb-4">{error}</p>}
            <div className="flex justify-center ">
              <button type="submit" className="font-bold text-white text-2xl bg-gray-900 p-4 w-3/12">提交</button>
            </div>
          </form>

            {/* todo  */}
            <div className="card card_list bg-white dark:bg-slate-800 w-full rounded-md border dark:border-slate-900">
              <ul className="tab flex text-center text-gray-400 ">
                <li className="tab_unchecked p-4 w-full border-b-2 border-r-2"><button type="button" onClick={handleHideCompleted}>隱藏已完成</button></li>
                <li className="tab_checked p-4 w-full border-b-2"><button type="button" onClick={handleDisplayCompleted}>顯示已完成</button></li>
              </ul>
              <div className="cart_content p-4 ">
                <ul className="list pr-8 relative">
                {todos && todos.length > 0 ? (
                  todos.map(todo => (
                    <li className="border-b-2 ml-2" key={todo.id}>
                      <div className="flex items-center">
                        <div className="flex-1">
                          <input className="mr-2" checked={todo.is_completed} type="checkbox" name="" id=""  onChange={()=>handleChangeTodoStatus(todo.id,todo.is_completed,todo.updated_at)}/>
                          <span className="mr-2 ml-4">任務:{todo.name}</span>
                          <br/><span className="mr-2 ml-9">描述:{todo.description} </span>
                          <br/><span className="mr-2 ml-9">(建立時間: {new Date(todo.created_at).toLocaleString()},</span> <span className="">更新時間: {updatedTime})</span>
                        </div>
                        <div className="ml-auto flex items-center">
                            <button className="mr-1" type="button" onClick={() => handleEditTodo(todo)} >編輯</button>
                          <button className="ml-1 text-red-700" type="button"
                          onClick={() => handleDelete(todo.id)}>刪除</button>
                        </div>
                       
                      </div>
                    </li>
                    
                  ))
                ) : (
                  <li className="border-b-2 ml-8">No todos found.</li>
                )}
                  
                </ul>
                <div className="pagination flex justify-center mt-4">
                  <button onClick={handlePrevPage} disabled={currentPage === 1} className="mr-4">上一頁</button>
                  <button onClick={handleNextPage}>下一頁</button>
                </div>
              </div>
            </div>
        </section>
        
      </main>
      <Modal
        isOpen={editModalOpen}
        onRequestClose={() => setEditModalOpen(false)}
        contentLabel="編輯任務"
        ariaHideApp={false}
      >
        <div className="bg-blue-900 h-full">
          <h1 className="text-center pt-8 mb-4 font-bold text-2xl text-white">編輯任務</h1>
          <div className="flex justify-center">
            <form onSubmit={handleSubmit} >
              <div className=" ml-14 mb-4">
                <label htmlFor="editTaskName" className="mr-2 text-white">任務名稱：</label>
                <input
                  type="text"
                  id="editTaskName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className=" ml-14">
                <label htmlFor="editTaskDescription" className="mr-2 text-white">任務描述：</label>
                <input
                  type="text"
                  id="editTaskDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="ml-28 mt-4 flex ">
                {error && <p style={{ color: "red" }}>{error}</p>}
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex justify-center mr-4">更新</button>
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex justify-center" onClick={()=>{handelCloseModal}}>取消</button>
              </div>
            </form>
          </div>
          
        </div>
      </Modal>
    </div>
  );
}
