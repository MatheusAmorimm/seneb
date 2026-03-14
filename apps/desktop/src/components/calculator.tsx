"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calculator as CalcIcon, ChevronRight, ChevronLeft } from "lucide-react";
import { useTheme } from "./theme_provider";

export function Calculator() {
  const { theme, isSidebarOpen } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState("0");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNext, setWaitingForNext] = useState(false);

  const isDark = theme === "dark";

  const inputDigit = useCallback((digit: string) => {
    setDisplay(prev => {
      if (waitingForNext) {
        setWaitingForNext(false);
        return digit;
      }
      return prev === "0" ? digit : prev + digit;
    });
  }, [waitingForNext]);

  const inputDecimal = useCallback(() => {
    setDisplay(prev => {
      if (waitingForNext) {
        setWaitingForNext(false);
        return "0.";
      }
      if (!prev.includes(".")) return prev + ".";
      return prev;
    });
  }, [waitingForNext]);

  const clear = useCallback(() => {
    setDisplay("0");
    setPrevValue(null);
    setOperation(null);
    setWaitingForNext(false);
  }, []);

  const performOperation = useCallback((nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operation) {
      const currentValue = prevValue || 0;
      let newValue = currentValue;

      switch (operation) {
        case "+": newValue = currentValue + inputValue; break;
        case "-": newValue = currentValue - inputValue; break;
        case "*": newValue = currentValue * inputValue; break;
        case "/": newValue = currentValue / inputValue; break;
      }

      setPrevValue(newValue);
      setDisplay(newValue.toString());
    }

    setWaitingForNext(true);
    setOperation(nextOperation);
  }, [display, prevValue, operation]);

  const calculate = useCallback(() => {
    if (!operation || prevValue === null) return;
    
    const inputValue = parseFloat(display);
    let newValue = prevValue;

    switch (operation) {
      case "+": newValue = prevValue + inputValue; break;
      case "-": newValue = prevValue - inputValue; break;
      case "*": newValue = prevValue * inputValue; break;
      case "/": newValue = prevValue / inputValue; break;
    }

    setDisplay(newValue.toString());
    setPrevValue(null);
    setOperation(null);
    setWaitingForNext(false);
  }, [display, prevValue, operation]);

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key >= "0" && e.key <= "9") inputDigit(e.key);
      if (e.key === "." || e.key === ",") inputDecimal();
      if (e.key === "+") performOperation("+");
      if (e.key === "-") performOperation("-");
      if (e.key === "*" || e.key.toLowerCase() === "x") performOperation("*");
      if (e.key === "/") performOperation("/");
      if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        calculate();
      }
      if (e.key === "Escape") clear();
      if (e.key === "Backspace") {
        setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : "0");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, inputDigit, inputDecimal, performOperation, calculate, clear]);

  return (
    <div 
      className={`fixed left-0 top-1/2 -translate-y-1/2 z-[100] transition-all duration-500 ease-in-out flex items-center ${
        isOpen ? "translate-x-0" : "-translate-x-[260px]"
      }`}
    >
      {/* Calculadora */}
      <div className={`p-4 rounded-r-[40px] shadow-[20px_0_50px_rgba(0,0,0,0.3)] w-[260px] border-y-2 border-r-2 transition-colors duration-300
        ${isDark ? "bg-[#1c1c1e] border-[#3a3a3c]" : "bg-[#f2f2f7] border-slate-200"}`}>
        <div className="h-20 flex items-end justify-end px-4 mb-4 overflow-hidden">
          <span className={`text-5xl font-light tracking-tighter truncate transition-colors duration-300
            ${isDark ? "text-white" : "text-[#1c1c1e]"}`}>
            {display}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <CalcButton onClick={clear} className={isDark ? "bg-[#a5a5a5] text-black hover:bg-[#d4d4d4]" : "bg-slate-300 text-black hover:bg-slate-400"}>AC</CalcButton>
          <CalcButton onClick={() => setDisplay((parseFloat(display) * -1).toString())} className={isDark ? "bg-[#a5a5a5] text-black hover:bg-[#d4d4d4]" : "bg-slate-300 text-black hover:bg-slate-400"}>+/-</CalcButton>
          <CalcButton onClick={() => setDisplay((parseFloat(display) / 100).toString())} className={isDark ? "bg-[#a5a5a5] text-black hover:bg-[#d4d4d4]" : "bg-slate-300 text-black hover:bg-slate-400"}>%</CalcButton>
          <CalcButton onClick={() => performOperation("/")} className={operation === "/" ? "bg-white text-[#ff9f0a]" : "bg-[#ff9f0a] text-white"}>÷</CalcButton>

          <CalcButton onClick={() => inputDigit("7")} className={isDark ? "bg-[#333333] text-white hover:bg-[#505050]" : "bg-white text-black shadow-sm hover:bg-slate-100"}>7</CalcButton>
          <CalcButton onClick={() => inputDigit("8")} className={isDark ? "bg-[#333333] text-white hover:bg-[#505050]" : "bg-white text-black shadow-sm hover:bg-slate-100"}>8</CalcButton>
          <CalcButton onClick={() => inputDigit("9")} className={isDark ? "bg-[#333333] text-white hover:bg-[#505050]" : "bg-white text-black shadow-sm hover:bg-slate-100"}>9</CalcButton>
          <CalcButton onClick={() => performOperation("*")} className={operation === "*" ? "bg-white text-[#ff9f0a]" : "bg-[#ff9f0a] text-white"}>×</CalcButton>

          <CalcButton onClick={() => inputDigit("4")} className={isDark ? "bg-[#333333] text-white hover:bg-[#505050]" : "bg-white text-black shadow-sm hover:bg-slate-100"}>4</CalcButton>
          <CalcButton onClick={() => inputDigit("5")} className={isDark ? "bg-[#333333] text-white hover:bg-[#505050]" : "bg-white text-black shadow-sm hover:bg-slate-100"}>5</CalcButton>
          <CalcButton onClick={() => inputDigit("6")} className={isDark ? "bg-[#333333] text-white hover:bg-[#505050]" : "bg-white text-black shadow-sm hover:bg-slate-100"}>6</CalcButton>
          <CalcButton onClick={() => performOperation("-")} className={operation === "-" ? "bg-white text-[#ff9f0a]" : "bg-[#ff9f0a] text-white"}>−</CalcButton>

          <CalcButton onClick={() => inputDigit("1")} className={isDark ? "bg-[#333333] text-white hover:bg-[#505050]" : "bg-white text-black shadow-sm hover:bg-slate-100"}>1</CalcButton>
          <CalcButton onClick={() => inputDigit("2")} className={isDark ? "bg-[#333333] text-white hover:bg-[#505050]" : "bg-white text-black shadow-sm hover:bg-slate-100"}>2</CalcButton>
          <CalcButton onClick={() => inputDigit("3")} className={isDark ? "bg-[#333333] text-white hover:bg-[#505050]" : "bg-white text-black shadow-sm hover:bg-slate-100"}>3</CalcButton>
          <CalcButton onClick={() => performOperation("+")} className={operation === "+" ? "bg-white text-[#ff9f0a]" : "bg-[#ff9f0a] text-white"}>+</CalcButton>

          <button onClick={() => inputDigit("0")} className={`col-span-2 h-12 flex items-center justify-start px-6 rounded-full text-xl transition-all
            ${isDark ? "bg-[#333333] text-white hover:bg-[#505050]" : "bg-white text-black shadow-sm hover:bg-slate-100"}`}>0</button>
          <CalcButton onClick={inputDecimal} className={isDark ? "bg-[#333333] text-white hover:bg-[#505050]" : "bg-white text-black shadow-sm hover:bg-slate-100"}>,</CalcButton>
          <CalcButton onClick={calculate} className="bg-[#ff9f0a] text-white hover:bg-[#ffb340]">=</CalcButton>
        </div>
      </div>

      {/* Lingueta (Toggle Tab) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`h-24 w-8 rounded-r-2xl flex flex-col items-center justify-center gap-2 border-r border-y transition-all group shadow-md
          ${isSidebarOpen ? "opacity-0 pointer-events-none -translate-x-full" : "opacity-100 translate-x-0"}
          ${isDark ? "bg-[#1c1c1e] hover:bg-[#333333] border-[#3a3a3c] text-white" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"}`}
        title={isOpen ? "Fechar Calculadora" : "Abrir Calculadora"}
      >
        <CalcIcon size={18} className="text-[#ff9f0a] group-hover:scale-110 transition-transform" />
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </div>
  );
}

function CalcButton({ children, onClick, className = "" }: { children: React.ReactNode, onClick: () => void, className?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-12 h-12 flex items-center justify-center rounded-full text-xl font-medium transition-all active:scale-90 ${className}`}
    >
      {children}
    </button>
  );
}
