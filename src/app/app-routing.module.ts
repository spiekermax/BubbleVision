// Angular
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

// Internal dependencies
import { HomePage } from "./feature/page/home/home.page";


const routes: Routes =
[
    { 
        path: "", 
        pathMatch: "full", 
        component: HomePage
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}