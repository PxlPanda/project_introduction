#include <iostream>
#include <string>
#include <vector>

int main() {

    int t = 0;
    int n = 0;
    int k = 0;
    std::string s = "";
    std::string c = "";
    std::vector<std::string> d;
    std::vector<std::string> spec;
    std::cin>>t;

    for (int i = 0;i<t;i++){

        std::cin>>n;
        for( int j = 0; j<n;j++){
            std::cin>>s;
            d.push_back(s);
        }

        std::cin>>k;
        for (int j = 0; j<k;k++){
            std::cin>>c;
            spec.push_back(c);
        }
    }

    for (int x = 0;x< d.size();x++){
        std::cout<<d[x];
    }
    for (int x = 0;x< spec.size();x++){
        std::cout<<spec[x];
    }
}