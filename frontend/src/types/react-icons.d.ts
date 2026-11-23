import * as React from "react";

declare module "react-icons" {
  export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
    children?: React.ReactNode;
    size?: string | number;
    color?: string;
    title?: string;
    className?: string;
    key?: any;
    onClick?: (e?: any) => void;
  }
}

declare module "react-icons/lib" {
  export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
    children?: React.ReactNode;
    size?: string | number;
    color?: string;
    title?: string;
    className?: string;
    key?: any;
    onClick?: (e?: any) => void;
  }
}

declare module "react-icons/lib/iconBase" {
  export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
    children?: React.ReactNode;
    size?: string | number;
    color?: string;
    title?: string;
    className?: string;
    key?: any;
    onClick?: (e?: any) => void;
  }
}

declare module "react-icons/lib/index" {
  export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
    children?: React.ReactNode;
    size?: string | number;
    color?: string;
    title?: string;
    className?: string;
    key?: any;
    onClick?: (e?: any) => void;
  }
}
