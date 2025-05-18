import axios from "axios";
// import Productdata from "../../static/Productdata";

export const fechAllProducts = () => async (dispatch) => {
  dispatch({ type: "getAllProductRequest" });

  try {
    
    const { data } = await axios.get(
      "http://localhost:5000/product/get-all-products")

    dispatch({ type: "getAllProductSuccess", payload : data.products });
    // console.log(data.products);
  } catch (error) {
    dispatch({ type: "getAllProductFail", payload : error.message });
  }
};




// create product
export const createProduct =
  (
    name,
    description,
    category,
    tags,
    originalPrice,
    discountPrice,
    stock,
    shopId,
    images
  ) =>
  async (dispatch) => {
    try {
      dispatch({
        type: "productCreateRequest",
      });

      const { data } = await axios.post(
       "http://localhost:5000/product/create-product",
        name,
        description,
        category,
        tags,
        originalPrice,
        discountPrice,
        stock,
        shopId,
        images,
      );
      dispatch({
        type: "productCreateSuccess",
        payload: data.product,
      });
      console.log(data.product);
    } catch (error) {
      dispatch({
        type: "productCreateFail",
        payload: error.response.data.message,
      });
      console.log(error.response.data.message);
    }
  };

// get All Products of a shop
export const getAllProductsShop = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllProductsShopRequest",
    });

    const { data } = await axios.get(
      `http://localhost:5000/product/get-all-products-shop/${id}`);
    dispatch({
      type: "getAllProductsShopSuccess",
      payload: data.products,
    });
    

    console.log(data);
    

  } catch (error) {
    dispatch({
      type: "getAllProductsShopFailed",
      payload: error.response.data.message,
    });
  }
};

// delete product of a shop
export const deleteProduct = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteProductRequest",
    });

    const { data } = await axios.delete(
      `http://localhost:5000/product/delete-shop-product/${id}`,


      {
        withCredentials: true,
      }
    );
    dispatch({
      type: "deleteProductSuccess",
      payload: data.message,
    });

    console.log(data.message);
  } catch (error) {
    dispatch({
      type: "deleteProductFailed",
      payload: error.response.data.message,
    });
  }
};


