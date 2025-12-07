import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-display",
  templateUrl: "./display.page.html",
  styleUrls: ["./display.page.scss"],
})
export class DisplayPage implements OnInit {
  currentTurn = {
    numero: "DV49",
    puesto: 3,
  };

  calledNumbers = [
    { numero: "DD03", puesto: 4 },
    { numero: "CN03", puesto: 7 },
    { numero: "CE42", puesto: 7 },
    { numero: "CE38", puesto: 7 },
  ];

  constructor() {}

  ngOnInit() {}
}
