const authenticate = async () => {
    const res = await fetch('http://localhost:9001/authenticate');
    const data = await res.json();
    return data;
}

export default authenticate;