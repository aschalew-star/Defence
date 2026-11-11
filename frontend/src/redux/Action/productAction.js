import axios from "axios";
import { server } from "../../server";

export const fechAllProducts = (params = {}) => async (dispatch) => {
  dispatch({ type: "getAllProductRequest" });

  try {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);
    if (params.category && params.category !== "all" && params.category !== "All") {
      query.append("category", params.category);
    }
    if (params.keyword) query.append("keyword", params.keyword);
    if (params.sort) query.append("sort", params.sort);
    if (params.minPrice) query.append("minPrice", params.minPrice);
    if (params.maxPrice) query.append("maxPrice", params.maxPrice);
    if (params.ratings) query.append("ratings", params.ratings);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const { data } = await axios.get(`${server}/product/get-all-products${queryString}`);

    dispatch({
      type: "getAllProductSuccess",
      payload: data.products,
      totalProducts: data.totalProducts,
      page: data.page,
      pages: data.pages,
      limit: data.limit,
    });
  } catch (error) {
    dispatch({
      type: "getAllProductFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// create product
export const createProduct =
  (
    productDataOrName,
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

      let payload;
      if (typeof productDataOrName === "object" && productDataOrName !== null) {
        payload = productDataOrName;
      } else {
        payload = {
          name: productDataOrName,
          description,
          category,
          tags,
          originalPrice,
          discountPrice,
          stock,
          shopId,
          images,
        };
      }

      const { data } = await axios.post(
        `${server}/product/create-product`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      dispatch({
        type: "productCreateSuccess",
        payload: data.product,
      });
    } catch (error) {
      dispatch({
        type: "productCreateFail",
        payload: error.response?.data?.message || error.message,
      });
    }
  };

// get all products of a shop
export const getAllProductsShop = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllProductsShopRequest",
    });

    const { data } = await axios.get(
      `${server}/product/get-all-products-shop/${id}`
    );

    dispatch({
      type: "getAllProductsShopSuccess",
      payload: data.products,
    });
  } catch (error) {
    dispatch({
      type: "getAllProductsShopFailed",
      payload: error.response?.data?.message || error.message,
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
      `${server}/product/delete-shop-product/${id}`,
      {
        withCredentials: true,
      }
    );

    dispatch({
      type: "deleteProductSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "deleteProductFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};

export default fechAllProducts;
