import streamlit as st
from services.persistence.exercise_repository import get_or_create_user


def render_login_wall():
    if st.session_state.get("user_id") is not None:
        return True
    
    st.title("🏋️‍♂️ AI Real-time GYM Trainer")
    st.markdown(" Enter your username to start.")

    with st.form("login_form", clear_on_submit=False):
        username = st.text_input("Name (unique)", placeholder="unique name e.g. VanditVijay18")
        submit_button = st.form_submit_button("Start Session", width="stretch")
        
    if submit_button:
        clean_name = (username or "").strip()
        if not clean_name:
            st.error("Please write your name.")
            return False      
        user = get_or_create_user(clean_name)  
        st.session_state["user_id"] = user["id"]
        st.session_state["username"] = user["username"]
        st.rerun()
    return False