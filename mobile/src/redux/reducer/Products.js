
import { createReducer } from "@reduxjs/toolkit";

const initialState = {
    isLoading:true,
    allProducts:[],
};

 export  const ProductReducer = createReducer(initialState,(builder)=>{
    //get all products

    builder.addCase( "getAllProductRequest",(state)=>{
        state.isLoading=true;
          })
   builder.addCase("getAllProductSuccess" ,(state,action)=>{
         state.isLoading=false;
         state.allProducts=action.payload;
          })
   builder.addCase( "getAllProductFail",(state,action)=>{
          state.error=action.payload;
          state.isLoading=false;
     })

     //create product

     builder.addCase( "productCreateRequest", (state) => {
        state.isLoading = true;
      },)

      builder.addCase( "productCreateSuccess",  (state, action) => {
        state.isLoading = false;
        state.product = action.payload;
        state.success = true;
      })

      builder.addCase( "productCreateFail", (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      }
    )
 

  // get all products of shop
  builder.addCase( "getAllProductsShopRequest", (state) => {
    state.isLoading = true;
  }
)


builder.addCase( "getAllProductsShopSuccess", (state, action) => {
    state.isLoading = false;
    state.products = action.payload;
  }
)


builder.addCase( "getAllProductsShopFailed",(state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
)
  
  // delete product of a shop

builder.addCase( "deleteProductRequest", (state) => {
    state.isLoading = true;
  }
)
  
builder.addCase( "deleteProductSuccess",(state, action) => {
    state.isLoading = false;
    state.message = action.payload;
  }
)
  
builder.addCase( "deleteProductFailed",(state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  })

 
  builder.addCase( "clearErrors",(state) => {
    state.error = null;
  })

});

